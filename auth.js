import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const usersCollection = collection(db, "users");
const legacyDataKeys = [
  "lifefit_workout_load_history",
  "lifefit_diet_profile",
  "lifefit_meal_plans_by_goal",
  "lifefit_body_metrics",
  "lifefit_diet_goals",
  "lifefit_calorie_intake",
  "lifefit_weight_history",
  "ritual_training_days"
];

function saveCurrentUser(user, profile = {}) {
  localStorage.setItem("lifefit_current_user", JSON.stringify({
    id: user.uid,
    name: profile.name || user.displayName || "",
    email: user.email || profile.email || ""
  }));
}

function migrateLocalData(legacyId, uid) {
  const legacyOwner = localStorage.getItem("lifefit_local_data_owner");
  const mayMoveUnscopedData = !legacyOwner || legacyOwner === legacyId;
  legacyDataKeys.forEach(key => {
    const newKey = `${key}_${uid}`;
    const oldValue = localStorage.getItem(`${key}_${legacyId}`) ??
      (mayMoveUnscopedData ? localStorage.getItem(key) : null);
    if (oldValue !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, oldValue);
    }
  });
  localStorage.setItem("lifefit_local_data_owner", uid);
}

async function ensureProfile(user, profile = {}) {
  const userDocument = doc(db, "users", user.uid);
  const snapshot = await getDoc(userDocument);
  if (!snapshot.exists()) {
    await setDoc(userDocument, {
      name: profile.name || user.displayName || "",
      email: user.email || profile.email || "",
      createdAt: new Date().toISOString()
    });
  }
}

async function migrateLegacyAccount(email, password, existingUser = null) {
  const legacyQuery = query(
    usersCollection,
    where("email", "==", email),
    where("password", "==", password)
  );
  const snapshot = await getDocs(legacyQuery);
  if (snapshot.empty) return null;

  const legacyDocument = snapshot.docs[0];
  const legacyData = legacyDocument.data();
  const user = existingUser || (await createUserWithEmailAndPassword(auth, email, password)).user;
  if (!existingUser) await updateProfile(user, { displayName: legacyData.name || "" });

  const { password: _legacyPassword, ...profileData } = legacyData;
  await setDoc(doc(db, "users", user.uid), {
    ...profileData,
    email: user.email,
    name: legacyData.name || "",
    migratedAt: new Date().toISOString()
  }, { merge: true });

  migrateLocalData(legacyDocument.id, user.uid);
  if (legacyDocument.id !== user.uid) {
    try {
      await updateDoc(legacyDocument.ref, { password: deleteField() });
    } catch (error) {
      console.error("A conta migrou, mas não foi possível remover a senha antiga do documento legado:", error);
      window.alert("Sua conta foi migrada, mas a senha antiga ainda está no registro legado. Peça ao administrador para removê-la.");
    }
  }
  return user;
}

function showAuthError(error, context) {
  console.error(`Erro de autenticação (${context}):`, error);
  const messages = {
    "auth/email-already-in-use": "Este e-mail já possui uma conta. Entre ou use a recuperação de senha.",
    "auth/invalid-email": "Informe um e-mail válido.",
    "auth/invalid-credential": "E-mail ou senha incorretos. Contas antigas podem ser migradas ao entrar com a senha anterior.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres. Contas antigas com senhas menores precisam redefini-la.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente novamente.",
    "auth/network-request-failed": "Sem conexão com o Firebase. Verifique a internet e tente novamente.",
    "auth/operation-not-allowed": "O provedor E-mail/senha não está habilitado no Firebase Authentication deste projeto. No Firebase Console, abra Authentication > Sign-in method e ative E-mail/senha.",
    "auth/configuration-not-found": "O Firebase Authentication ainda não foi configurado para o projeto hackathon-000. No Firebase Console, abra Authentication, conclua a configuração e ative o provedor E-mail/senha.",
    "auth/unauthorized-domain": "Este endereço não está autorizado pelo Firebase Authentication. Abra Authentication > Settings > Authorized domains no Firebase Console e adicione localhost ou o domínio publicado. Acesse o site por localhost/HTTPS, não por file://.",
    "auth/invalid-api-key": "A chave da configuração Firebase é inválida para este projeto. Confira a configuração do app Web em Project settings > General no Firebase Console."
  };
  window.alert(messages[error?.code] || error?.message || `Não foi possível ${context}. Tente novamente.`);
}

const loginForm = document.getElementById("login-form") || document.querySelector(".auth-form");
if (loginForm) {
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const email = (document.getElementById("login-email") || document.getElementById("email")).value.trim();
    const password = (document.getElementById("login-password") || document.getElementById("password")).value;
    const submitButton = loginForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    try {
      let user;
      try {
        ({ user } = await signInWithEmailAndPassword(auth, email, password));
      } catch (error) {
        if (!["auth/user-not-found", "auth/invalid-credential", "auth/invalid-login-credentials"].includes(error?.code)) {
          throw error;
        }
        user = await migrateLegacyAccount(email, password);
        if (!user) throw error;
      }
      const profileSnapshot = await getDoc(doc(db, "users", user.uid));
      if (!profileSnapshot.exists()) {
        const migratedUser = await migrateLegacyAccount(email, password, user);
        if (migratedUser) user = migratedUser;
      }
      await ensureProfile(user);
      const profile = (await getDoc(doc(db, "users", user.uid))).data() || {};
      saveCurrentUser(user, profile);
      window.location.href = "index.html";
    } catch (error) {
      showAuthError(error, "entrar na conta");
    } finally {
      submitButton.disabled = false;
    }
  });
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async event => {
    event.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm-password").value;
    if (password !== confirmPassword) {
      window.alert("As senhas não coincidem.");
      return;
    }
    const submitButton = registerForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "users", user.uid), {
        name,
        email: user.email,
        createdAt: new Date().toISOString()
      });
      saveCurrentUser(user, { name, email: user.email });
      window.location.href = "index.html";
    } catch (error) {
      showAuthError(error, "criar a conta");
    } finally {
      submitButton.disabled = false;
    }
  });
}

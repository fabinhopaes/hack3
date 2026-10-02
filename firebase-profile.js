(async function initializeProfileIntegration() {
  const cloudFields = new Set([
    "workoutHistory",
    "dietProfile",
    "mealPlans",
    "bodyMetrics",
    "dietGoals",
    "calorieIntake",
    "weightHistory"
  ]);
  const localStorageFields = {
    workoutHistory: "lifefit_workout_load_history",
    dietProfile: "lifefit_diet_profile",
    mealPlans: "lifefit_meal_plans_by_goal",
    bodyMetrics: "lifefit_body_metrics",
    dietGoals: "lifefit_diet_goals",
    calorieIntake: "lifefit_calorie_intake",
    weightHistory: "lifefit_weight_history"
  };
  let currentUser;
  let userDocument;
  let updateUserDocument;
  let currentCloudData;
  let resolveFirebaseReady;
  const firebaseReady = new Promise(resolve => {
    resolveFirebaseReady = resolve;
  });
  const pendingWrites = new Map();
  window.lifeFitCloudSync = {
    save(field, value) {
      if (!cloudFields.has(field)) {
        return Promise.reject(new Error(`Campo Firebase não permitido: ${field}`));
      }
      if (!currentUser?.id) {
        return Promise.reject(new Error("É necessário entrar na conta para sincronizar os dados."));
      }

      const previousWrite = pendingWrites.get(field) || Promise.resolve();
      const serializedWrite = previousWrite.catch(() => {}).then(async () => {
        const ready = await firebaseReady;
        if (!ready || !userDocument || !updateUserDocument) {
          throw new Error("O Firebase ainda não está disponível para esta conta.");
        }
        await updateUserDocument(userDocument, { [field]: value });
        const storageKey = localStorageFields[field];
        try {
          localStorage.setItem(`${storageKey}_${currentUser.id}`, JSON.stringify(value));
        } catch (error) {
          console.error(`Os dados de ${field} foram sincronizados, mas não puderam ser atualizados no cache local:`, error);
        }
        if (currentCloudData) {
          currentCloudData[field] = value;
          window.lifeFitCloudData = { ...currentCloudData };
          window.dispatchEvent(new CustomEvent("lifefit:cloud-data-updated", {
            detail: { [field]: value }
          }));
        }
      });
      pendingWrites.set(field, serializedWrite);
      return serializedWrite.finally(() => {
        if (pendingWrites.get(field) === serializedWrite) pendingWrites.delete(field);
      });
    }
  };

  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const miniName = document.getElementById("user-name");
  const miniEmail = document.getElementById("user-email");
  const goalsForm = document.getElementById("profile-goals-form");
  const objectiveSelect = document.getElementById("profile-objective");
  const trainingLevelSelect = document.getElementById("profile-training-level");
  const goalsStatus = document.getElementById("profile-goals-status");
  const accountStatus = document.getElementById("profile-account-status");
  const saveButton = goalsForm.querySelector('button[type="submit"]');
  const dashboardDataStatus = document.getElementById("dashboard-data-status");
  const dashboardObjective = document.getElementById("dashboard-objective");
  const dashboardObjectiveStatus = document.getElementById("dashboard-objective-status");
  const dashboardTrainingLevel = document.getElementById("dashboard-training-level");
  const dashboardTrainingHint = document.getElementById("dashboard-training-hint");
  const dashboardTrainingCount = document.getElementById("dashboard-training-count");
  const dashboardTrainingCountHint = document.getElementById("dashboard-training-count-hint");
  const dashboardLastTraining = document.getElementById("dashboard-last-training");
  const dashboardLastTrainingDate = document.getElementById("dashboard-last-training-date");
  const dashboardTrainingBadge = document.getElementById("dashboard-training-badge");
  const dashboardGreeting = document.getElementById("dashboard-greeting");
  const dashboardGuidance = document.getElementById("dashboard-guidance");
  const dashboardInsight = document.getElementById("dashboard-insight");

  function showGoalsStatus(message, isError = false) {
    goalsStatus.textContent = message;
    goalsStatus.className = isError ? "profile-goals-error" : "profile-goals-success";
  }

  function showIdentity(name, email) {
    const displayName = name || email || "Usuário Life Fit";
    profileName.textContent = displayName;
    profileEmail.textContent = email || "E-mail não informado";
    miniName.textContent = displayName;
    miniEmail.textContent = email || "Conta Life Fit";
  }

  const objectiveTitles = {
    "fat-loss": "Emagrecer / perder gordura",
    "muscle-gain": "Ganhar massa muscular",
    maintain: "Manter o peso",
    performance: "Melhorar o desempenho",
    "healthy-habits": "Melhorar meus hábitos"
  };
  const objectiveGuidance = {
    "fat-loss": "Seu foco é reduzir gordura com hábitos consistentes. Consulte o módulo Dieta para ver seu plano.",
    "muscle-gain": "Seu foco é ganhar massa muscular. Confira seus treinos e plano alimentar para acompanhar sua rotina.",
    maintain: "Seu foco é manter o peso com uma rotina equilibrada. Acompanhe seus treinos e refeições.",
    performance: "Seu foco é melhorar o desempenho. Mantenha seus treinos e refeições alinhados à sua rotina.",
    "healthy-habits": "Seu foco é construir hábitos saudáveis. Registre seus treinos e acompanhe sua consistência."
  };
  const trainingLevelTitles = {
    beginner: "Iniciante",
    intermediate: "Intermediário",
    advanced: "Avançado"
  };

  function renderDashboard(userData) {
    const goals = userData.goals && typeof userData.goals === "object" ? userData.goals : {};
    const goalTitle = objectiveTitles[goals.objective];
    const levelTitle = trainingLevelTitles[goals.trainingLevel];
    const trainingDays = Array.isArray(userData.trainingDays)
      ? [...new Set(userData.trainingDays.filter(day => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day)))].sort()
      : [];
    const today = new Date();
    const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-`;
    const monthlyTrainingDays = trainingDays.filter(day => day.startsWith(monthPrefix));

    dashboardGreeting.textContent = userData.name
      ? `Olá, ${userData.name.split(/\s+/)[0]}!`
      : "Bem-vindo ao Life Fit";
    dashboardObjective.textContent = goalTitle || "Defina seu objetivo";
    dashboardObjectiveStatus.textContent = goalTitle ? "Meta da sua conta" : "Configure em Perfil & Metas";
    dashboardTrainingLevel.textContent = levelTitle || "Não definido";
    dashboardTrainingHint.textContent = levelTitle ? "Nível salvo no seu perfil" : "Configure em Perfil & Metas";
    dashboardTrainingCount.textContent = monthlyTrainingDays.length;
    dashboardTrainingCountHint.textContent = "Neste mês · sincronizado com o Firebase";

    dashboardGuidance.textContent = goals.objective && objectiveGuidance[goals.objective]
      ? objectiveGuidance[goals.objective]
      : "Defina seu objetivo em Perfil & Metas para receber uma mensagem alinhada à sua jornada.";
    dashboardInsight.textContent = trainingDays.length
      ? `Você já registrou ${trainingDays.length} ${trainingDays.length === 1 ? "dia de treino" : "dias de treino"} nesta conta. Cada registro ajuda a acompanhar sua consistência.`
      : "Ainda não há treinos registrados nesta conta. Use “Registrar treino” depois de concluir uma sessão para iniciar seu histórico.";

    const mostRecentTraining = trainingDays.at(-1);
    if (mostRecentTraining) {
      const [year, month, day] = mostRecentTraining.split("-").map(Number);
      dashboardLastTraining.textContent = "Treino registrado";
      dashboardLastTrainingDate.textContent = new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(year, month - 1, day));
      dashboardTrainingBadge.hidden = false;
    } else {
      dashboardLastTraining.textContent = "Nenhum treino registrado";
      dashboardLastTrainingDate.textContent = "Registre um treino para iniciar seu histórico.";
      dashboardTrainingBadge.hidden = true;
    }
  }

  function showDashboardStatus(message, isError = false) {
    dashboardDataStatus.textContent = message;
    dashboardDataStatus.className = isError ? "dashboard-data-status error" : "dashboard-data-status";
  }

  try {
    currentUser = JSON.parse(localStorage.getItem("lifefit_current_user") || "null");
  } catch (error) {
    console.error("Não foi possível ler a sessão Life Fit:", error);
    showIdentity("", "");
    showGoalsStatus("Não foi possível ler os dados da sessão. Entre novamente pela tela de login.", true);
    showDashboardStatus("Não foi possível carregar a conta para montar o painel.", true);
    saveButton.disabled = true;
    resolveFirebaseReady(false);
    return;
  }

  if (!currentUser || typeof currentUser.id !== "string" || !currentUser.id) {
    showIdentity(currentUser?.name || "", currentUser?.email || "");
    showGoalsStatus("Entre pela tela de login para carregar e salvar suas metas no Firebase.", true);
    dashboardGreeting.textContent = "Entre para ver seu painel";
    dashboardGuidance.textContent = "Seu objetivo, nível de treino e histórico serão carregados da sua conta Life Fit.";
    dashboardObjective.textContent = "Sem dados";
    dashboardObjectiveStatus.textContent = "Faça login para carregar";
    dashboardTrainingLevel.textContent = "Sem dados";
    dashboardTrainingHint.textContent = "Faça login para carregar";
    dashboardTrainingCount.textContent = "—";
    dashboardTrainingCountHint.textContent = "Faça login para carregar";
    dashboardInsight.textContent = "Entre na sua conta para ver metas e treinos sincronizados.";
    dashboardLastTraining.textContent = "Faça login para carregar";
    dashboardLastTrainingDate.textContent = "O histórico é associado à sua conta.";
    showDashboardStatus("Painel aguardando os dados da conta.", true);
    saveButton.disabled = true;
    resolveFirebaseReady(false);
    return;
  }

  showIdentity(currentUser.name, currentUser.email);
  showGoalsStatus("Carregando seus dados do Firebase...");
  saveButton.disabled = true;
  const pendingTrainingDates = [];
  let syncTrainingDay;
  window.addEventListener("lifefit:training-day-registered", event => {
    const registeredDate = event.detail?.date;
    if (typeof registeredDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(registeredDate)) {
      console.error("Data inválida recebida para sincronizar o treino:", registeredDate);
      showDashboardStatus("O treino não pôde ser sincronizado: data inválida.", true);
      return;
    }

    if (syncTrainingDay) {
      void syncTrainingDay(registeredDate);
    } else {
      pendingTrainingDates.push(registeredDate);
      showDashboardStatus("Treino registrado neste navegador; aguardando conexão com o Firebase.");
    }
  });

  try {
    const [{ arrayUnion, doc, getDoc, updateDoc }, { auth, db }, { signOut }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"),
      import("./firebase-config.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")
    ]);
    await auth.authStateReady();
    window.lifeFitCloudSync.signOut = () => signOut(auth);
    userDocument = doc(db, "users", currentUser.id);
    updateUserDocument = updateDoc;
    const snapshot = await getDoc(userDocument);
    if (!snapshot.exists()) {
      throw new Error("O documento da conta não foi encontrado no Firestore.");
    }

    const userData = snapshot.data();
    const legacyDataOwner = localStorage.getItem("lifefit_local_data_owner");
    const canMigrateLegacyData = !legacyDataOwner || legacyDataOwner === currentUser.id;
    if (!legacyDataOwner) {
      localStorage.setItem("lifefit_local_data_owner", currentUser.id);
    }
    const localData = {};
    for (const [field, key] of Object.entries(localStorageFields)) {
      const scopedKey = `${key}_${currentUser.id}`;
      const raw = localStorage.getItem(scopedKey) ??
        (canMigrateLegacyData ? localStorage.getItem(key) : null);
      if (raw === null) continue;
      try {
        const value = JSON.parse(raw);
        if (value && typeof value === "object" &&
            (Array.isArray(value) === ["calorieIntake", "weightHistory"].includes(field))) {
          localData[field] = value;
        } else {
          throw new Error(`Formato inválido para ${key}.`);
        }
      } catch (error) {
        console.error(`Não foi possível ler os dados locais de ${field}:`, error);
        showDashboardStatus(`Não foi possível carregar os dados locais de ${field}.`, true);
      }
    }

    const trainingDaysStorageKey = `ritual_training_days_${currentUser.id}`;
    let localTrainingDays = [];
    try {
      const savedTrainingDays = JSON.parse(localStorage.getItem(trainingDaysStorageKey) || "[]");
      if (!Array.isArray(savedTrainingDays) ||
          savedTrainingDays.some(day => typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day))) {
        throw new Error("O histórico local de treinos está em formato inválido.");
      }
      localTrainingDays = [...new Set(savedTrainingDays)].sort();
    } catch (error) {
      console.error("Não foi possível recuperar o histórico local para sincronização:", error);
      showDashboardStatus("Painel carregado, mas não foi possível recuperar o histórico local de treinos.", true);
    }
    const accountName = typeof userData.name === "string" ? userData.name : currentUser.name;
    const accountEmail = typeof userData.email === "string" ? userData.email : currentUser.email;

    const cloudData = {};
    const migrationPatch = {};
    for (const field of cloudFields) {
      if (Object.prototype.hasOwnProperty.call(userData, field)) {
        cloudData[field] = userData[field];
      } else if (Object.prototype.hasOwnProperty.call(localData, field)) {
        cloudData[field] = localData[field];
        migrationPatch[field] = localData[field];
      }
      if (Object.prototype.hasOwnProperty.call(cloudData, field)) {
        localStorage.setItem(`${localStorageFields[field]}_${currentUser.id}`, JSON.stringify(cloudData[field]));
      }
    }

    const remoteTrainingDays = Array.isArray(userData.trainingDays)
      ? userData.trainingDays.filter(day => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day))
      : [];
    cloudData.trainingDays = [...new Set([...remoteTrainingDays, ...localTrainingDays])].sort();
    if (cloudData.trainingDays.length !== remoteTrainingDays.length) {
      migrationPatch.trainingDays = cloudData.trainingDays;
    }
    userData.trainingDays = cloudData.trainingDays;
    localStorage.setItem(trainingDaysStorageKey, JSON.stringify(cloudData.trainingDays));

    if (Object.prototype.hasOwnProperty.call(userData, "goals")) {
      cloudData.goals = userData.goals;
    }
    cloudData.name = accountName;
    cloudData.email = accountEmail;
    currentCloudData = cloudData;
    window.lifeFitCloudData = cloudData;
    showIdentity(accountName, accountEmail);
    renderDashboard({ ...userData, ...cloudData, name: accountName });
    accountStatus.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Conta conectada';
    showDashboardStatus("Dados do painel carregados da sua conta.");

    syncTrainingDay = async registeredDate => {
      showDashboardStatus("Sincronizando seu treino com o Firebase...");
      try {
        await updateDoc(userDocument, { trainingDays: arrayUnion(registeredDate) });
        userData.trainingDays = [...new Set([...(Array.isArray(userData.trainingDays) ? userData.trainingDays : []), registeredDate])].sort();
        cloudData.trainingDays = userData.trainingDays;
        localStorage.setItem(trainingDaysStorageKey, JSON.stringify(userData.trainingDays));
        window.lifeFitCloudData = { ...cloudData };
        window.dispatchEvent(new CustomEvent("lifefit:cloud-data-updated", {
          detail: { trainingDays: userData.trainingDays }
        }));
        renderDashboard({ ...userData, name: accountName });
        showDashboardStatus("Treino registrado e sincronizado com sua conta.");
      } catch (error) {
        console.error("Erro ao sincronizar o treino com o Firebase:", error);
        showDashboardStatus("O registro está neste navegador, mas não foi sincronizado com o Firebase. Verifique a conexão e as regras do Firestore.", true);
      }
    };
    if (migrationPatch.trainingDays) {
      try {
        await updateDoc(userDocument, {
          ...migrationPatch,
          trainingDays: arrayUnion(...migrationPatch.trainingDays)
        });
        showDashboardStatus("Dados locais migrados e sincronizados com sua conta.");
      } catch (error) {
        console.error("Não foi possível migrar todos os dados locais para o Firebase:", error);
        showDashboardStatus("Alguns dados estão carregados neste navegador, mas não foram migrados. Verifique as permissões do Firestore.", true);
      }
      delete migrationPatch.trainingDays;
    }
    if (Object.keys(migrationPatch).length) {
      try {
        await updateDoc(userDocument, migrationPatch);
        showDashboardStatus("Dados locais migrados e sincronizados com sua conta.");
      } catch (error) {
        console.error("Não foi possível migrar os dados locais para o Firebase:", error);
        showDashboardStatus("Os dados estão carregados neste navegador, mas não foram migrados. Verifique as permissões do Firestore.", true);
      }
    }
    resolveFirebaseReady(true);
    window.dispatchEvent(new CustomEvent("lifefit:cloud-data-loaded", { detail: cloudData }));

    for (const date of [...new Set(pendingTrainingDates)]) {
      await syncTrainingDay(date);
    }
    pendingTrainingDates.length = 0;

    const goals = userData.goals;
    if (goals && typeof goals === "object") {
      if (["fat-loss", "muscle-gain", "maintain", "performance", "healthy-habits"].includes(goals.objective)) {
        objectiveSelect.value = goals.objective;
      }
      if (["beginner", "intermediate", "advanced"].includes(goals.trainingLevel)) {
        trainingLevelSelect.value = goals.trainingLevel;
      }
    }

    showGoalsStatus(objectiveSelect.value && trainingLevelSelect.value
      ? "Metas carregadas da sua conta."
      : "Escolha seu objetivo e nível para salvar suas metas.");
    saveButton.disabled = false;

    goalsForm.addEventListener("submit", async event => {
      event.preventDefault();
      if (!goalsForm.reportValidity()) return;

      saveButton.disabled = true;
      showGoalsStatus("Salvando suas metas no Firebase...");

      try {
        await updateDoc(userDocument, {
          goals: {
            objective: objectiveSelect.value,
            trainingLevel: trainingLevelSelect.value,
            updatedAt: new Date().toISOString()
          }
        });
        userData.goals = {
          objective: objectiveSelect.value,
          trainingLevel: trainingLevelSelect.value,
          updatedAt: new Date().toISOString()
        };
        cloudData.goals = userData.goals;
        window.lifeFitCloudData = { ...cloudData };
        window.dispatchEvent(new CustomEvent("lifefit:cloud-data-updated", {
          detail: { goals: userData.goals }
        }));
        renderDashboard({ ...userData, name: accountName });
        showGoalsStatus("Metas salvas na sua conta Life Fit.");
      } catch (error) {
        resolveFirebaseReady(false);
        console.error("Erro ao salvar metas no Firebase:", error);
        showGoalsStatus("Não foi possível salvar suas metas. Verifique as regras de gravação do Firestore.", true);
      } finally {
        saveButton.disabled = false;
      }
    });
  } catch (error) {
    console.error("Erro ao carregar o perfil do Firebase:", error);
    showGoalsStatus("Não foi possível carregar seu perfil do Firebase. Verifique sua conexão e as regras do Firestore.", true);
    dashboardGreeting.textContent = currentUser.name
      ? `Olá, ${currentUser.name.split(/\s+/)[0]}!`
      : "Painel indisponível";
    dashboardGuidance.textContent = "Não foi possível consultar suas metas no Firebase.";
    dashboardObjective.textContent = "Indisponível";
    dashboardObjectiveStatus.textContent = "Falha ao carregar";
    dashboardTrainingLevel.textContent = "Indisponível";
    dashboardTrainingHint.textContent = "Falha ao carregar";
    dashboardTrainingCount.textContent = "—";
    dashboardTrainingCountHint.textContent = "Falha ao consultar a conta";
    dashboardInsight.textContent = "Confira sua conexão e as regras do Firestore para carregar seu histórico.";
    dashboardLastTraining.textContent = "Histórico indisponível";
    dashboardLastTrainingDate.textContent = "Não foi possível carregar a data do último treino.";
    dashboardTrainingBadge.hidden = true;
    showDashboardStatus("Não foi possível carregar os dados do painel. Verifique sua conexão e as regras do Firestore.", true);
  }
})();

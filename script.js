document.addEventListener('DOMContentLoaded', () => {
  let activeSessionUser = null;
  try {
    const savedSession = JSON.parse(localStorage.getItem('lifefit_current_user') || 'null');
    if (typeof savedSession?.id === 'string' && savedSession.id) activeSessionUser = savedSession;
  } catch (error) {
    console.error('Não foi possível identificar a conta para separar os dados locais:', error);
  }
  const userStorageKey = key => activeSessionUser ? `${key}_${activeSessionUser.id}` : key;

  const logoutButton = document.getElementById('logout-button');
  logoutButton.addEventListener('click', async () => {
    try {
      if (window.lifeFitCloudSync?.signOut) await window.lifeFitCloudSync.signOut();
      localStorage.removeItem('lifefit_current_user');
      window.location.href = window.location.pathname.includes('/lifefit/')
        ? '../login.html'
        : 'login.html';
    } catch (error) {
      console.error('Não foi possível encerrar a sessão Life Fit:', error);
      window.alert('Não foi possível encerrar a sessão com segurança. Verifique a conexão e tente novamente.');
    }
  });

  // ========================================================
  // 1. SISTEMA DE NAVEGAÇÃO POR ABAS
  // ========================================================
  const navLinks = document.querySelectorAll('.nav-link');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('page-title');

  const tabTitles = {
    dashboard: "Painel Principal",
    workouts: "Treinos",
    diet: "Módulo Dieta",
    imc: "Calculadora IMC",
    profile: "Perfil & Metas"
  };

  const workoutPlans = {
    a: {
      title: "Treino A — Peito & Tríceps",
      duration: "55 a 70 min",
      averageDuration: "~63 min",
      calories: "250 a 450 kcal",
      averageCalories: "~350 kcal",
      order: "Peito → Ombro → Tríceps, dos movimentos compostos aos isoladores.",
      guidance: ["Faça aquecimento geral e séries leves de supino antes das séries válidas."],
      exercises: [
        { name: "Supino Reto com Barra", muscle: "Peito", sets: 4, reps: "8 a 10 repetições", rest: "90 a 120 s" },
        { name: "Supino Inclinado com Halteres", muscle: "Peito Superior", sets: 3, reps: "10 a 12 repetições", rest: "60 a 90 s" },
        { name: "Crossover na Polia", muscle: "Peito", sets: 3, reps: "12 a 15 repetições", rest: "60 s" },
        { name: "Desenvolvimento com Halteres", muscle: "Ombro", sets: 3, reps: "8 a 10 repetições", rest: "90 s" },
        { name: "Elevação Lateral com Halteres", muscle: "Ombro Lateral", sets: 4, reps: "12 a 15 repetições", rest: "60 s" },
        { name: "Tríceps Testa com Barra W", muscle: "Tríceps", sets: 3, reps: "10 a 12 repetições", rest: "60 a 90 s" },
        { name: "Tríceps Pulley na Corda", muscle: "Tríceps", sets: 3, reps: "12 a 15 repetições", rest: "60 s" }
      ]
    },
    b: {
      title: "Treino B — Costas & Bíceps",
      duration: "55 a 70 min",
      averageDuration: "~63 min",
      calories: "250 a 450 kcal",
      averageCalories: "~350 kcal",
      calorieGuide: "Estimativa por peso corporal: 60 kg, 220 a 300 kcal; 75 kg, 290 a 390 kcal; 90 kg, 350 a 480 kcal.",
      order: "Costas → Ombro Posterior → Bíceps. Deixe o bíceps para o final para não cansá-lo antes das puxadas e remadas.",
      guidance: [
        "Aqueça com 2 séries leves na puxada alta, usando cerca de 50% da carga habitual.",
        "Nas puxadas e remadas, guie o movimento pelos cotovelos e aproxime as escápulas, sem puxar só com as mãos e antebraços."
      ],
      exercises: [
        { name: "Puxada Alta na Polia", muscle: "Costas — Largura", sets: 4, reps: "8 a 10 repetições", rest: "90 a 120 s" },
        { name: "Remada Curvada com Barra", muscle: "Costas — Espessura", sets: 3, reps: "8 a 10 repetições", rest: "90 a 120 s" },
        { name: "Remada Unilateral com Halter (Serrote)", muscle: "Costas", sets: 3, reps: "10 a 12 repetições", rest: "60 a 90 s" },
        { name: "Crucifixo Invertido com Halteres", muscle: "Ombro Posterior", sets: 3, reps: "12 a 15 repetições", rest: "60 s" },
        { name: "Rosca Direta com Barra W", muscle: "Bíceps", sets: 3, reps: "10 a 12 repetições", rest: "60 a 90 s" },
        { name: "Rosca Martelo com Halteres", muscle: "Bíceps e Braquiorradial", sets: 3, reps: "10 a 12 repetições", rest: "60 s" },
        { name: "Rosca Scott com Halter ou na Máquina", muscle: "Bíceps", sets: 3, reps: "12 a 15 repetições", rest: "60 s" }
      ]
    },
    c: {
      title: "Treino C — Quadríceps",
      duration: "55 a 70 min",
      averageDuration: "~63 min",
      calories: "300 a 500 kcal",
      averageCalories: "~400 kcal",
      calorieGuide: "Estimativa por peso corporal: 60 kg, 250 a 330 kcal; 75 kg, 320 a 420 kcal; 90 kg, 380 a 520 kcal.",
      order: "Agachamento e Leg Press → Passada e Cadeira Extensora → Panturrilha.",
      guidance: [
        "Faça mobilidade de tornozelo e quadril e 2 a 3 séries progressivas de aquecimento no agachamento.",
        "Use amplitude confortável no agachamento e no Leg Press, sem curvar a lombar."
      ],
      exercises: [
        { name: "Agachamento Livre com Barra", muscle: "Quadríceps e Glúteos", sets: 4, reps: "8 a 10 repetições", rest: "90 a 120 s" },
        { name: "Leg Press 45°", muscle: "Quadríceps", sets: 3, reps: "10 a 12 repetições", rest: "90 a 120 s" },
        { name: "Cadeira Extensora", muscle: "Quadríceps — Isolador", sets: 4, reps: "12 a 15 repetições", rest: "60 a 90 s" },
        { name: "Passada / Afundo com Halteres", muscle: "Quadríceps e Glúteos", sets: 3, reps: "10 a 12 passos por perna", rest: "60 a 90 s" },
        { name: "Gêmeos em Pé / Panturrilha no Leg Press", muscle: "Panturrilha", sets: 4, reps: "12 a 15 repetições", rest: "60 s" }
      ]
    },
    d: {
      title: "Treino D — Posterior & Glúteo",
      duration: "50 a 65 min",
      averageDuration: "~58 min",
      calories: "280 a 480 kcal",
      averageCalories: "~380 kcal",
      calorieGuide: "Estimativa por peso corporal: 60 kg, 230 a 310 kcal; 75 kg, 290 a 390 kcal; 90 kg, 350 a 470 kcal.",
      order: "Stiff e Elevação Pélvica → Búlgaro e Mesa Flexora → Cadeira Abdutora.",
      guidance: [
        "No Stiff, mantenha a coluna neutra e leve o quadril para trás; o esforço deve ficar no posterior e nos glúteos.",
        "Na Elevação Pélvica, segure a contração no topo por 1 a 2 segundos sem hiperestender a lombar."
      ],
      exercises: [
        { name: "Stiff com Barra ou Halteres", muscle: "Posterior de Coxa e Glúteos", sets: 4, reps: "8 a 10 repetições", rest: "90 a 120 s" },
        { name: "Elevação Pélvica com Barra", muscle: "Glúteo Máximo", sets: 4, reps: "8 a 10 repetições", rest: "90 a 120 s" },
        { name: "Mesa Flexora ou Cadeira Flexora", muscle: "Posterior de Coxa — Isolador", sets: 3, reps: "10 a 12 repetições", rest: "60 a 90 s" },
        { name: "Agachamento Búlgaro com Halteres", muscle: "Glúteos e Posterior", sets: 3, reps: "10 a 12 repetições por perna", rest: "60 a 90 s" },
        { name: "Cadeira Abdutora", muscle: "Glúteo Médio e Mínimo", sets: 3, reps: "12 a 15 repetições", rest: "60 s" }
      ]
    }
  };

  const workoutGrid = document.querySelector('#tab-workouts .workouts-grid');
  const workoutDetail = document.getElementById('workout-detail');
  const workoutDetailContent = document.getElementById('workout-detail-content');
  const workoutProgressKey = userStorageKey('lifefit_workout_load_history');

  function syncUserData(field, value, feedback, successMessage) {
    const sync = window.lifeFitCloudSync;
    if (!sync) {
      feedback.textContent = 'Salvo neste navegador, mas o Firebase ainda não está disponível.';
      feedback.className = 'save-feedback-error';
      return;
    }

    feedback.textContent = 'Salvo neste navegador. Sincronizando com o Firebase...';
    feedback.className = 'save-feedback-success';
    sync.save(field, value).then(() => {
      feedback.textContent = successMessage;
      feedback.className = 'save-feedback-success';
    }).catch(error => {
      console.error(`Não foi possível sincronizar ${field} com o Firebase:`, error);
      feedback.textContent = 'Salvo neste navegador, mas não foi sincronizado com o Firebase. Verifique sua conta, conexão e permissões.';
      feedback.className = 'save-feedback-error';
    });
  }

  function readWorkoutHistory() {
    try {
      return JSON.parse(localStorage.getItem(workoutProgressKey) || '{}');
    } catch {
      return {};
    }
  }

  function writeWorkoutHistory(history) {
    try {
      localStorage.setItem(workoutProgressKey, JSON.stringify(history));
      return true;
    } catch {
      return false;
    }
  }

  function getWorkoutRepEstimate(repsText) {
    const matches = String(repsText).match(/\d+/g);
    if (!matches?.length) return 1;
    const values = matches.slice(0, 2).map(Number);
    return values.length > 1 ? Math.round((values[0] + values[1]) / 2) : values[0];
  }

  function normalizeHistoryDate(date) {
    if (typeof date !== 'string') return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const localized = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    return localized ? `${localized[3]}-${String(localized[2]).padStart(2, '0')}-${String(localized[1]).padStart(2, '0')}` : null;
  }

  function renderLineChart(container, points, { target, targetLabel, emptyText, unit = '', zeroBaseline = true } = {}) {
    if (!container) return;
    const validPoints = points.filter(point => Number.isFinite(point.value)).slice(-12);
    if (!validPoints.length) {
      container.innerHTML = `<p class="chart-empty">${emptyText}</p>`;
      return;
    }

    const width = 720;
    const height = 250;
    const left = 48;
    const right = 20;
    const top = 22;
    const bottom = 38;
    const values = validPoints.map(point => point.value);
    if (Number.isFinite(target)) values.push(target);
    const rawMinimum = Math.min(...values);
    const rawMaximum = Math.max(...values);
    const padding = zeroBaseline ? 0 : Math.max((rawMaximum - rawMinimum) * 0.12, Math.abs(rawMaximum) * 0.015, 1);
    const minValue = zeroBaseline ? Math.min(0, rawMinimum) : rawMinimum - padding;
    const maxValue = Math.max(minValue + 1, zeroBaseline ? rawMaximum : rawMaximum + padding);
    const range = maxValue - minValue;
    const x = index => left + (validPoints.length === 1 ? (width - left - right) / 2 : index * (width - left - right) / (validPoints.length - 1));
    const y = value => top + (maxValue - value) * (height - top - bottom) / range;
    const line = validPoints.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');
    const grid = Array.from({ length: 4 }, (_, index) => {
      const gridY = top + index * (height - top - bottom) / 3;
      const labelValue = Math.round(maxValue - index * range / 3);
      return `<line class="chart-grid-line" x1="${left}" y1="${gridY}" x2="${width - right}" y2="${gridY}"></line><text class="chart-axis-label" x="${left - 8}" y="${gridY + 4}" text-anchor="end">${labelValue}</text>`;
    }).join('');
    const targetMarkup = Number.isFinite(target)
      ? `<line class="chart-target-line" x1="${left}" y1="${y(target)}" x2="${width - right}" y2="${y(target)}"></line>`
      : '';
    const labels = validPoints.map((point, index) =>
      `<text class="chart-date-label" x="${x(index)}" y="${height - 12}" text-anchor="middle">${point.label}</text>`
    ).join('');
    const dots = validPoints.map((point, index) =>
      `<circle class="chart-point" cx="${x(index)}" cy="${y(point.value)}" r="4"><title>${point.label}: ${point.value}${unit}</title></circle>`
    ).join('');
    container.innerHTML = `<svg class="progress-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${validPoints.map(point => `${point.label}: ${point.value}${unit}`).join('; ')}">
      ${grid}${targetMarkup}<polyline class="chart-data-line" points="${line}"></polyline>${dots}${labels}
    </svg>
    <div class="chart-legend"><span><i class="chart-legend-dot chart-legend-data"></i> ${unit === ' kg' ? 'Peso registrado' : unit === ' kcal' ? 'Consumo registrado' : 'Volume estimado'}</span>
      ${Number.isFinite(target) ? `<span><i class="chart-legend-dot chart-legend-target"></i> ${targetLabel || `Meta: ${target}${unit}`}</span>` : ''}
    </div>`;
  }

  function getWorkoutVolumeByDate(history = readWorkoutHistory()) {
    const dailyVolume = new Map();
    Object.entries(history || {}).forEach(([exerciseKey, records]) => {
      const [workoutId, indexText] = exerciseKey.split('-');
      const exercise = workoutPlans[workoutId]?.exercises[Number(indexText)];
      (Array.isArray(records) ? records : []).forEach(record => {
        const date = normalizeHistoryDate(record.date);
        const weight = Number(record.weight);
        if (!date || !Number.isFinite(weight) || weight <= 0) return;
        const sets = Number.isFinite(Number(record.sets)) && Number(record.sets) > 0
          ? Number(record.sets)
          : exercise?.sets || 1;
        const reps = Number.isFinite(Number(record.reps)) && Number(record.reps) > 0
          ? Number(record.reps)
          : exercise ? getWorkoutRepEstimate(exercise.reps) : 1;
        dailyVolume.set(date, (dailyVolume.get(date) || 0) + weight * sets * reps);
      });
    });
    return dailyVolume;
  }

  function getWorkoutCaloriesByDate(history = readWorkoutHistory()) {
    const workoutsPerDate = new Map();
    Object.entries(history || {}).forEach(([exerciseKey, records]) => {
      const [workoutId] = exerciseKey.split('-');
      if (!workoutPlans[workoutId]) return;
      (Array.isArray(records) ? records : []).forEach(record => {
        const date = normalizeHistoryDate(record.date);
        if (!date || Number(record.weight) <= 0) return;
        if (!workoutsPerDate.has(date)) workoutsPerDate.set(date, new Set());
        workoutsPerDate.get(date).add(workoutId);
      });
    });
    const caloriesPerDate = new Map();
    workoutsPerDate.forEach((workoutIds, date) => {
      const calories = [...workoutIds].reduce((total, workoutId) => {
        const values = workoutPlans[workoutId].calories.match(/\d+/g)?.map(Number) || [];
        const sessionEstimate = values.length > 1
          ? (values[0] + values[1]) / 2
          : values[0] || 0;
        return total + sessionEstimate;
      }, 0);
      caloriesPerDate.set(date, calories);
    });
    return caloriesPerDate;
  }

  function renderWorkoutVolumeChart(history = readWorkoutHistory()) {
    const dailyVolume = getWorkoutVolumeByDate(history);
    renderLineChart(
      document.getElementById('workout-volume-chart'),
      [...dailyVolume].sort(([first], [second]) => first.localeCompare(second))
        .map(([date, value]) => ({ label: date.slice(5).replace('-', '/'), value: Math.round(value) })),
      { unit: ' kg·rep', emptyText: 'Registre as cargas, séries e repetições realizadas para acompanhar o volume por treino.' }
    );
  }

  function getRecordVolume(record, exerciseKey) {
    const [workoutId, indexText] = exerciseKey.split('-');
    const exercise = workoutPlans[workoutId]?.exercises[Number(indexText)];
    const sets = Number(record.sets) > 0 ? Number(record.sets) : exercise?.sets || 1;
    const reps = Number(record.reps) > 0
      ? Number(record.reps)
      : exercise ? getWorkoutRepEstimate(exercise.reps) : 1;
    return Number(record.weight) * sets * reps;
  }

  function getWorkoutProgress(currentVolume, previousVolume) {
    if (previousVolume === null) return { label: 'Primeiro registro', className: 'progress-first' };
    if (currentVolume > previousVolume) return { label: 'Volume evoluindo', className: 'progress-up' };
    if (currentVolume < previousVolume) return { label: 'Volume regredindo', className: 'progress-down' };
    return { label: 'Estagnado', className: 'progress-same' };
  }

  function updateExerciseProgress(input) {
    const exerciseKey = input.dataset.exerciseKey;
    const history = readWorkoutHistory();
    const records = history[exerciseKey] || [];
    const previousRecord = records.length ? records[records.length - 1] : null;
    const exerciseCard = input.closest('.workout-exercise');
    const sets = Number(exerciseCard.querySelector('[data-exercise-sets]').value);
    const reps = Number(exerciseCard.querySelector('[data-exercise-reps]').value);
    const progress = input.value === ''
      ? { label: 'Informe a carga para comparar', className: 'progress-pending' }
      : getWorkoutProgress(
        Number(input.value) * sets * reps,
        previousRecord ? getRecordVolume(previousRecord, exerciseKey) : null
      );
    const status = workoutDetailContent.querySelector(`[data-progress-for="${exerciseKey}"]`);
    const previous = workoutDetailContent.querySelector(`[data-previous-for="${exerciseKey}"]`);

    status.textContent = progress.label;
    status.className = `workout-progress ${progress.className}`;
    previous.textContent = previousRecord
      ? `Último volume: ${Math.round(getRecordVolume(previousRecord, exerciseKey))} kg·rep (${previousRecord.date})`
      : 'Sem carga anterior registrada';
  }

  function renderWorkoutDetail(workoutId) {
    const workout = workoutPlans[workoutId];
    if (!workout) return;

    const exercisesMarkup = workout.exercises.map((exercise, index) => {
      const exerciseKey = `${workoutId}-${index}`;
      const inputId = `load-${exerciseKey}`;
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} execução correta exercício`)}`;
      const prescribedReps = getWorkoutRepEstimate(exercise.reps);
      return `
        <article class="workout-exercise">
          <div class="workout-exercise-heading">
            <span class="workout-exercise-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
            <div class="workout-exercise-info">
              <h3>${exercise.name}</h3>
              <p>${exercise.muscle}</p>
            </div>
          </div>
          <div class="workout-exercise-prescription">
            <div><span>Séries</span><strong>${exercise.sets}</strong></div>
            <div><span>Repetições</span><strong>${exercise.reps}</strong></div>
            <div><span>Descanso</span><strong>${exercise.rest}</strong></div>
          </div>
          <a class="workout-video-link" href="${youtubeSearchUrl}" target="_blank" rel="noopener noreferrer">
            <i class="fa-brands fa-youtube" aria-hidden="true"></i>
            <span>Ver execução no YouTube</span>
            <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
          </a>
          <div class="workout-load-entry">
            <label for="${inputId}"><i class="fa-solid fa-dumbbell" aria-hidden="true"></i> Carga usada (kg)</label>
            <input id="${inputId}" type="number" min="0.5" step="0.5" inputmode="decimal" placeholder="Ex.: 40" data-exercise-key="${exerciseKey}">
            <div class="workout-completed-volume">
              <label for="sets-${exerciseKey}">Séries realizadas</label>
              <input id="sets-${exerciseKey}" type="number" min="1" max="30" step="1" value="${exercise.sets}" data-exercise-sets required>
              <label for="reps-${exerciseKey}">Repetições por série</label>
              <input id="reps-${exerciseKey}" type="number" min="1" max="100" step="1" value="${prescribedReps}" data-exercise-reps required>
            </div>
            <span class="workout-progress progress-pending" data-progress-for="${exerciseKey}" aria-live="polite">Informe a carga para comparar</span>
            <small data-previous-for="${exerciseKey}">Sem carga anterior registrada</small>
          </div>
        </article>`;
    }).join('');

    const guidanceMarkup = workout.guidance.map(note => `<li>${note}</li>`).join('');
    workoutDetailContent.innerHTML = `
      <section class="workout-detail-overview">
        <header class="workout-detail-header">
          <span class="workout-detail-icon" aria-hidden="true"><i class="fa-solid fa-dumbbell"></i></span>
          <div>
            <span class="workout-detail-kicker">SUA FICHA DE TREINO</span>
            <h2>${workout.title}</h2>
            <p>Registre suas cargas e acompanhe sua evolução a cada sessão.</p>
          </div>
        </header>
        <div class="workout-detail-metrics">
          <div>
            <span class="workout-metric-icon" aria-hidden="true"><i class="fa-regular fa-clock"></i></span>
            <div><span>Tempo médio</span><strong>${workout.averageDuration}</strong><small>${workout.duration} no total</small></div>
          </div>
          <div>
            <span class="workout-metric-icon" aria-hidden="true"><i class="fa-solid fa-fire"></i></span>
            <div><span>Gasto calórico médio</span><strong>${workout.averageCalories}</strong><small>${workout.calories} por sessão</small></div>
          </div>
        </div>
        ${workout.calorieGuide ? `<p class="workout-calorie-guide"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>${workout.calorieGuide}</span></p>` : ''}
        <p class="workout-execution-order"><i class="fa-solid fa-list-ol" aria-hidden="true"></i><span><strong>Ordem de execução</strong>${workout.order}</span></p>
      </section>
      <form class="workout-load-form" id="workout-load-form" data-workout-id="${workoutId}">
        <div class="workout-exercise-list-header">
          <div><span>SEU TREINO</span><h3>Exercícios</h3></div>
          <span>${workout.exercises.length} exercícios</span>
        </div>
        <div class="workout-exercise-list">${exercisesMarkup}</div>
        <div class="workout-save-row">
          <div class="workout-save-message"><span class="workout-save-icon" aria-hidden="true"><i class="fa-solid fa-shield-halved"></i></span><p id="workout-save-feedback" aria-live="polite">Suas cargas ficam salvas neste dispositivo.</p></div>
          <button class="btn-primary" type="submit"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Salvar cargas</button>
        </div>
      </form>
      <footer class="workout-detail-footer">
        <section class="workout-guidance">
          <span class="workout-guidance-icon" aria-hidden="true"><i class="fa-solid fa-lightbulb"></i></span>
          <div><h3>Aquecimento e execução</h3><ul>${guidanceMarkup}</ul></div>
        </section>
      </footer>`;

    workoutDetailContent.querySelectorAll('.workout-exercise').forEach(exerciseCard => {
      const loadInput = exerciseCard.querySelector('[data-exercise-key]');
      const setsInput = exerciseCard.querySelector('[data-exercise-sets]');
      const repsInput = exerciseCard.querySelector('[data-exercise-reps]');
      updateExerciseProgress(loadInput);
      [loadInput, setsInput, repsInput].forEach(input => {
        input.addEventListener('input', () => updateExerciseProgress(loadInput));
      });
    });

    workoutDetailContent.querySelector('#workout-load-form').addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      const inputs = [...form.querySelectorAll('[data-exercise-key]')];
      const filledInputs = inputs.filter(input => input.value !== '');
      const feedback = form.querySelector('#workout-save-feedback');

      if (!filledInputs.length) {
        feedback.textContent = 'Informe ao menos uma carga antes de salvar.';
        feedback.className = 'save-feedback-error';
        return;
      }

      const history = readWorkoutHistory();
      filledInputs.forEach(input => {
        const exerciseKey = input.dataset.exerciseKey;
        const exerciseCard = input.closest('.workout-exercise');
        const setsInput = exerciseCard.querySelector('[data-exercise-sets]');
        const repsInput = exerciseCard.querySelector('[data-exercise-reps]');
        if (!setsInput.validity.valid || !repsInput.validity.valid || !input.validity.valid) {
          setsInput.reportValidity();
          repsInput.reportValidity();
          input.reportValidity();
          return;
        }
        const sets = Number(setsInput.value);
        const reps = Number(repsInput.value);
        const records = history[exerciseKey] || [];
        const previousRecord = records.length ? records[records.length - 1] : null;
        const currentVolume = Number(input.value) * sets * reps;
        const progress = getWorkoutProgress(
          currentVolume,
          previousRecord ? getRecordVolume(previousRecord, exerciseKey) : null
        );
        const status = workoutDetailContent.querySelector(`[data-progress-for="${exerciseKey}"]`);
        const previous = workoutDetailContent.querySelector(`[data-previous-for="${exerciseKey}"]`);

        status.textContent = progress.label;
        status.className = `workout-progress ${progress.className}`;
        previous.textContent = previousRecord
          ? `Último volume: ${Math.round(getRecordVolume(previousRecord, exerciseKey))} kg·rep (${previousRecord.date})`
          : 'Sem carga anterior registrada';
        records.push({
          weight: Number(input.value),
          sets,
          reps,
          date: getLocalDateKey(new Date())
        });
        history[exerciseKey] = records.slice(-30);
      });

      const savedSuccessfully = writeWorkoutHistory(history);
      feedback.textContent = savedSuccessfully
        ? 'Cargas salvas neste navegador. A evolução foi comparada com o treino anterior.'
        : 'Não foi possível salvar neste navegador.';
      feedback.className = savedSuccessfully ? 'save-feedback-success' : 'save-feedback-error';
      if (savedSuccessfully) {
        syncUserData('workoutHistory', history, feedback, 'Cargas sincronizadas com sua conta.');
        renderWorkoutVolumeChart(history);
        renderWorkoutDietInsight();
      }
    });

    workoutGrid.hidden = true;
    workoutDetail.hidden = false;
    updatePageTitle('workouts');
    workoutDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeWorkoutDetail() {
    if (!workoutDetail) return;
    workoutDetail.hidden = true;
    workoutGrid.hidden = false;
  }

  document.querySelectorAll('[data-workout]').forEach(button => {
    button.addEventListener('click', () => renderWorkoutDetail(button.dataset.workout));
  });

  const backToWorkoutsButton = document.getElementById('btn-back-workouts');
  if (backToWorkoutsButton) {
    backToWorkoutsButton.addEventListener('click', () => {
      closeWorkoutDetail();
      updatePageTitle('workouts');
    });
  }

  const mealDefaults = [
    { id: 'breakfast', title: 'Café da manhã', time: '08:00', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=200' },
    { id: 'lunch', title: 'Almoço', time: '12:30', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200' },
    { id: 'afternoon-snack', title: 'Café da tarde', time: '16:30', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200' },
    { id: 'dinner', title: 'Jantar', time: '20:00', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200' }
  ];

  const dietMenus = {
    'fat-loss': {
      breakfast: ['2 ovos mexidos ou cozidos', '1 fatia de pão integral ou de centeio', '1 porção de morangos, mirtilos ou 1 kiwi', '1 xícara de café ou chá verde sem açúcar'],
      lunch: ['130 a 150 g de peito de frango, peru ou peixe grelhado', '3 a 4 colheres de sopa de arroz integral ou batata-doce cozida', 'Metade do prato de salada fresca e legumes cozidos no vapor', '1 colher de sobremesa de azeite virgem extra'],
      'afternoon-snack': ['1 iogurte natural magro ou proteico', '1 colher de sopa de chia ou cerca de 15 g de amêndoas/nozes', '1 maçã ou 1 pera'],
      dinner: ['130 a 150 g de peixe grelhado ou omelete de 2 ovos com espinafre', 'Salada farta de folhas verdes ou legumes assados', '2 colheres de sopa de grão-de-bico, lentilhas ou quinoa']
    },
    'muscle-gain': {
      breakfast: ['3 ovos mexidos', '2 fatias de pão integral com 1 colher de requeijão light', '1 banana com 2 colheres de sopa de aveia e mel', 'Café com leite semidesnatado ou bebida vegetal'],
      lunch: ['180 a 200 g de peito de frango, patinho moído ou peixe', '2 conchas de arroz integral ou branco', '1 concha de feijão', 'Legumes variados e salada à vontade com azeite'],
      'afternoon-snack': ['Vitamina com 250 ml de leite ou água e 1 dose de whey ou proteína vegetal', '1 banana e 30 g de aveia', '1 colher de sopa de pasta de amendoim'],
      dinner: ['180 g de frango, peixe ou carne magra', '200 a 250 g de batata-doce, mandioca ou arroz', 'Salada colorida com legumes grelhados']
    },
    maintain: {
      breakfast: ['2 ovos cozidos ou mexidos', '1 fatia de pão integral ou 1 tapioca média', '1 porção de maçã, mamão ou morangos', 'Café ou chá sem açúcar'],
      lunch: ['150 g de proteína magra', '1 concha de arroz integral ou 3 colheres de servir de batata cozida', '1 concha média de feijão ou lentilha', 'Metade do prato de salada folhosa e legumes'],
      'afternoon-snack': ['1 iogurte natural com 1 colher de sopa de granola sem açúcar', '15 a 20 g de castanhas ou nozes'],
      dinner: ['150 g de proteína grelhada ou assada', '3 a 4 colheres de sopa de quinoa, arroz ou purê de mandioca', 'Salada farta com azeite de oliva e limão']
    },
    performance: {
      breakfast: ['1 tapioca recheada com 2 ovos ou frango desfiado', '1 copo de suco natural de laranja ou beterraba com limão', '1 fatia de mamão com 1 colher de chia'],
      lunch: ['160 a 180 g de proteína magra', 'Porção de massa integral, arroz integral ou batata', '1 concha de feijão ou grão-de-bico', 'Salada e vegetais como brócolis, espinafre ou cenoura'],
      'afternoon-snack': ['2 fatias de pão integral com geleia 100% fruta', '1 colher de pasta de amendoim e 1 banana', 'Café, se fizer parte da sua rotina e for bem tolerado'],
      dinner: ['160 g de peixe, frango ou omelete', 'Purê de batata ou mandioca', 'Legumes assados ou cozidos no vapor']
    },
    'healthy-habits': {
      breakfast: ['Panqueca de 1 banana amassada, 1 ovo e 2 colheres de aveia com canela', 'Café, chá ou infusão de ervas sem açúcar'],
      lunch: ['Metade do prato de salada e vegetais cozidos de pelo menos 3 cores', 'Um quarto do prato de proteína magra ou vegetal', 'Um quarto do prato de arroz integral, quinoa ou tubérculos com leguminosas'],
      'afternoon-snack': ['1 fruta da estação picada', '1 iogurte natural com sementes de abóbora ou girassol'],
      dinner: ['Sopa caseira de legumes variados com proteína desfiada', 'Ou prato leve e colorido semelhante ao almoço, ajustado à fome']
    }
  };

  const dietGoalTitles = {
    'fat-loss': 'Emagrecer / perder gordura',
    'muscle-gain': 'Ganhar massa muscular',
    maintain: 'Manter o peso',
    performance: 'Melhorar o desempenho',
    'healthy-habits': 'Melhorar meus hábitos'
  };

  const dietGoalGuidance = {
    'fat-loss': 'Sugestões com porções moderadas, proteínas e vegetais. Evite restrições extremas; ajuste com orientação profissional.',
    'muscle-gain': 'Sugestões com mais energia e proteína para apoiar o treino de força. As porções precisam ser ajustadas à sua rotina.',
    maintain: 'Sugestões variadas para uma rotina equilibrada. Ajuste quantidades conforme fome, atividade e orientação profissional.',
    performance: 'Sugestões com fontes de carboidrato e proteína ao longo do dia para apoiar treino e recuperação.',
    'healthy-habits': 'Sugestões variadas com frutas, vegetais, leguminosas e alimentos pouco processados.'
  };

  const dietProfileForm = document.getElementById('diet-profile-form');
  const dietProfileStep = document.getElementById('diet-profile-step');
  const dietPlanView = document.getElementById('diet-plan-view');
  const dietPlanOverview = document.getElementById('diet-plan-overview');
  const dietGoalSelect = document.getElementById('diet-goal');
  const dietGoalGuidanceEl = document.getElementById('diet-goal-guidance');
  const dietPlanGoalEl = document.getElementById('diet-plan-goal');
  const mealsList = document.getElementById('meals-list');
  const dietDashboard = document.querySelector('#tab-diet .diet-dashboard');
  const dietFocus = document.querySelector('#tab-diet .diet-focus');
  const mealDetail = document.getElementById('meal-detail');
  const mealDetailContent = document.getElementById('meal-detail-content');
  const mealPlanStorageKey = userStorageKey('lifefit_meal_plans_by_goal');
  const dietProfileStorageKey = userStorageKey('lifefit_diet_profile');
  const dietGoalsStorageKey = userStorageKey('lifefit_diet_goals');
  const calorieIntakeStorageKey = userStorageKey('lifefit_calorie_intake');
  const weightHistoryStorageKey = userStorageKey('lifefit_weight_history');
  let activeDietGoal = 'maintain';
  let dietProfile = null;
  let mealPlans = [];
  let dietGoals = {};
  let calorieIntake = [];
  let weightHistory = [];
  const nutritionSearchCache = new Map();

  function escapeMealText(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function parseOptionalNutrient(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
  }

  function readFoodNutrition(input) {
    return {
      productName: input.dataset.productName || null,
      kcalPer100g: parseOptionalNutrient(input.dataset.kcalPer100g),
      proteinPer100g: parseOptionalNutrient(input.dataset.proteinPer100g),
      carbohydratesPer100g: parseOptionalNutrient(input.dataset.carbohydratesPer100g),
      fatPer100g: parseOptionalNutrient(input.dataset.fatPer100g),
      source: input.dataset.source || null
    };
  }

  function calculateSavedMealCalories(amounts, nutrition) {
    if (!Array.isArray(amounts) || !Array.isArray(nutrition) ||
        !amounts.length || amounts.length !== nutrition.length) return null;
    const itemCalories = amounts.map((amount, index) => {
      const kcalPer100g = parseOptionalNutrient(nutrition[index]?.kcalPer100g);
      return Number.isFinite(amount) && amount > 0 && kcalPer100g !== null
        ? amount * kcalPer100g / 100
        : null;
    });
    return itemCalories.every(Number.isFinite)
      ? Math.round(itemCalories.reduce((sum, value) => sum + value, 0))
      : null;
  }

  function calculateMealNutrition(amounts, nutrition) {
    if (!Array.isArray(amounts) || !Array.isArray(nutrition) ||
        !amounts.length || amounts.length !== nutrition.length) {
      return { calories: null, protein: null, carbohydrates: null, fat: null };
    }
    const totals = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
    const complete = { calories: true, protein: true, carbohydrates: true, fat: true };
    amounts.forEach((amount, index) => {
      const amountInGrams = Number(amount);
      const food = nutrition[index] || {};
      const nutrients = {
        calories: food.kcalPer100g,
        protein: food.proteinPer100g,
        carbohydrates: food.carbohydratesPer100g,
        fat: food.fatPer100g
      };
      Object.entries(nutrients).forEach(([nutrient, per100g]) => {
        const value = parseOptionalNutrient(per100g);
        if (!Number.isFinite(amountInGrams) || amountInGrams <= 0 || value === null) {
          complete[nutrient] = false;
          return;
        }
        totals[nutrient] += value * amountInGrams / 100;
      });
    });
    return Object.fromEntries(Object.keys(totals).map(nutrient => [
      nutrient,
      complete[nutrient]
        ? nutrient === 'calories' ? Math.round(totals[nutrient]) : Number(totals[nutrient].toFixed(1))
        : null
    ]));
  }

  function readDietArray(key, label) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(value)) throw new Error(`Formato inválido para ${label}.`);
      return value;
    } catch (error) {
      console.error(`Não foi possível carregar ${label}:`, error);
      return [];
    }
  }

  function loadDietGoals() {
    try {
      const goals = JSON.parse(localStorage.getItem(dietGoalsStorageKey) || '{}');
      return goals && typeof goals === 'object' && !Array.isArray(goals) ? goals : {};
    } catch (error) {
      console.error('Não foi possível carregar suas metas de alimentação:', error);
      return {};
    }
  }

  calorieIntake = readDietArray(calorieIntakeStorageKey, 'o histórico de consumo')
    .filter(item => item && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(Number(item.calories)));
  weightHistory = readDietArray(weightHistoryStorageKey, 'o histórico de peso')
    .filter(item => item && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(Number(item.weight)));
  dietGoals = loadDietGoals();

  function estimateDietTargets(profile) {
    const sexAdjustment = profile.sex === 'male' ? 5 : profile.sex === 'female' ? -161 : -78;
    const restingEstimate = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + sexAdjustment;
    const objectiveAdjustment = profile.goal === 'fat-loss' ? -250
      : profile.goal === 'muscle-gain' || profile.goal === 'performance' ? 200
        : 0;
    const dailyCalories = Math.round((restingEstimate * 1.2 + objectiveAdjustment) / 50) * 50;
    const weightAdjustment = profile.goal === 'fat-loss' ? -0.05
      : profile.goal === 'muscle-gain' ? 0.05
        : 0;
    return {
      targetWeight: Math.round(profile.weight * (1 + weightAdjustment) * 10) / 10,
      dailyCalories: Math.max(500, dailyCalories)
    };
  }

  function getDietTargets(profile = dietProfile) {
    const estimate = profile ? estimateDietTargets(profile) : {};
    return {
      targetWeight: Number.isFinite(Number(dietGoals.targetWeight)) ? Number(dietGoals.targetWeight) : estimate.targetWeight,
      dailyCalories: Number.isFinite(Number(dietGoals.dailyCalories)) ? Number(dietGoals.dailyCalories) : estimate.dailyCalories
    };
  }

  function writeDietCollection(field, key, value, feedback, successText) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Não foi possível salvar ${field} neste navegador:`, error);
      feedback.textContent = `Não foi possível salvar ${field} neste navegador.`;
      feedback.className = 'diet-profile-error';
      return false;
    }
    const cloudSync = window.lifeFitCloudSync;
    if (!cloudSync) {
      feedback.textContent = `Salvo neste navegador, mas ${field} ainda não pode ser sincronizado com o Firebase.`;
      feedback.className = 'diet-profile-error';
      return true;
    }
    cloudSync.save(field, value).then(() => {
      feedback.textContent = successText;
      feedback.className = 'diet-profile-success';
    }).catch(error => {
      console.error(`Não foi possível sincronizar ${field} com o Firebase:`, error);
      feedback.textContent = `Salvo neste navegador, mas ${field} não foi sincronizado com o Firebase. Verifique sua conta, conexão e permissões.`;
      feedback.className = 'diet-profile-error';
    });
    return true;
  }

  function renderDietAnalytics() {
    if (!dietProfile) return;
    dietGoals = loadDietGoals();
    const targets = getDietTargets();
    const targetWeightInput = document.getElementById('diet-target-weight');
    const targetCaloriesInput = document.getElementById('diet-target-calories');
    if (targetWeightInput) targetWeightInput.value = Number.isFinite(targets.targetWeight) ? targets.targetWeight : '';
    if (targetCaloriesInput) targetCaloriesInput.value = Number.isFinite(targets.dailyCalories) ? targets.dailyCalories : '';
    const guidance = document.getElementById('diet-target-guidance');
    if (guidance) {
      guidance.textContent = dietGoals.dailyCalories
        ? 'Meta editável. Se foi gerada automaticamente, é apenas uma estimativa inicial baseada no perfil e em um fator sedentário aproximado; ajuste com orientação profissional.'
        : 'Estimativa inicial baseada no perfil e em um fator sedentário aproximado. Ajuste conforme sua rotina e orientação profissional.';
    }

    const today = getLocalDateKey(new Date());
    const todayCalories = calorieIntake
      .filter(item => item.date === today && Number.isFinite(Number(item.calories)))
      .reduce((sum, item) => sum + Number(item.calories), 0);
    const estimatedTrainingCalories = getWorkoutCaloriesByDate().get(today) || 0;
    const netCalories = Math.max(0, Math.round(todayCalories - estimatedTrainingCalories));
    const dailyDifference = Number.isFinite(targets.dailyCalories)
      ? netCalories - targets.dailyCalories
      : null;
    const balanceLabel = dailyDifference === null
      ? 'meta diária não definida'
      : dailyDifference > 0
        ? `${Math.round(dailyDifference)} kcal acima da meta após o gasto estimado`
        : `${Math.round(Math.abs(dailyDifference))} kcal abaixo da meta após o gasto estimado`;
    const summary = document.getElementById('calorie-today-summary');
    if (summary) {
      const workoutLabel = estimatedTrainingCalories
        ? `treino: ~${Math.round(estimatedTrainingCalories)} kcal gastas`
        : 'sem gasto de treino calculado';
      summary.textContent = `Consumo: ${Math.round(todayCalories)} / ${Number.isFinite(targets.dailyCalories) ? targets.dailyCalories : '—'} kcal · ${workoutLabel} · saldo líquido estimado: ${netCalories} kcal, ${balanceLabel}.`;
    }

    const dailyIntake = new Map();
    calorieIntake.forEach(item => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !Number.isFinite(Number(item.calories))) return;
      dailyIntake.set(item.date, (dailyIntake.get(item.date) || 0) + Number(item.calories));
    });
    const sevenDays = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      const date = getLocalDateKey(day);
      return { label: date.slice(5).replace('-', '/'), value: dailyIntake.get(date) || 0 };
    });
    renderLineChart(document.getElementById('calorie-history-chart'),
      dailyIntake.size ? sevenDays : [],
      { target: targets.dailyCalories, targetLabel: `Meta: ${targets.dailyCalories} kcal`, unit: ' kcal', emptyText: 'Ainda não há refeições registradas como consumidas. Abra uma refeição calculada e use “Registrar como consumida”.' });

    const sortedWeights = [...weightHistory]
      .filter(item => /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(Number(item.weight)))
      .sort((first, second) => first.date.localeCompare(second.date));
    renderLineChart(document.getElementById('weight-history-chart'),
      sortedWeights.map(item => ({ label: item.date.slice(5).replace('-', '/'), value: Number(item.weight) })),
      { target: targets.targetWeight, targetLabel: `Meta: ${targets.targetWeight} kg`, unit: ' kg', zeroBaseline: false, emptyText: 'Registre seu peso para começar a acompanhar sua evolução.' });
    renderWorkoutDietInsight();
  }

  function renderWorkoutDietInsight() {
    const insight = document.getElementById('workout-diet-insight');
    if (!insight) return;
    const history = readWorkoutHistory();
    const volumeByDate = getWorkoutVolumeByDate(history);
    const exerciseCaloriesByDate = getWorkoutCaloriesByDate(history);
    let storedTrainingDays = [];
    try {
      const localDays = JSON.parse(localStorage.getItem(userStorageKey('ritual_training_days')) || '[]');
      if (Array.isArray(localDays)) {
        storedTrainingDays = localDays.filter(date => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date));
      }
    } catch (error) {
      console.error('Não foi possível ler os dias de treino para os insights:', error);
    }
    const caloriesByDate = new Map();
    calorieIntake.forEach(item => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(Number(item.calories))) {
        caloriesByDate.set(item.date, (caloriesByDate.get(item.date) || 0) + Number(item.calories));
      }
    });
    const targets = getDietTargets();
    const targetCalories = Number.isFinite(targets.dailyCalories) ? targets.dailyCalories : null;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 29);
    const cutoffKey = getLocalDateKey(cutoff);
    const trainingDates = new Set([
      ...storedTrainingDays,
      ...(Array.isArray(window.lifeFitCloudData?.trainingDays) ? window.lifeFitCloudData.trainingDays : []),
      ...volumeByDate.keys(),
      ...exerciseCaloriesByDate.keys()
    ]);
    const matchedDates = [...volumeByDate.keys()]
      .filter(date => date >= cutoffKey && caloriesByDate.has(date))
      .sort();
    const insights = [];

    const excessWithoutTraining = [...caloriesByDate]
      .filter(([date, calories]) => date >= cutoffKey &&
        targetCalories !== null && calories > targetCalories && !trainingDates.has(date))
      .map(([date]) => date);
    insights.push(excessWithoutTraining.length
      ? `${excessWithoutTraining.length} dia(s) nos últimos 30 ultrapassaram a meta calórica sem treino registrado.`
      : 'Não há dias registrados nos últimos 30 em que o consumo ultrapassou a meta sem treino.');

    if (matchedDates.length) {
      const averageCalories = Math.round(matchedDates.reduce((sum, date) => sum + caloriesByDate.get(date), 0) / matchedDates.length);
      const averageVolume = Math.round(matchedDates.reduce((sum, date) => sum + volumeByDate.get(date), 0) / matchedDates.length);
      insights.push(`${matchedDates.length} dia(s) tiveram treino e alimentação registrados juntos: média de ${averageCalories} kcal consumidas e ${averageVolume} kg·rep de volume.`);
    } else {
      insights.push('Ainda faltam dias com treino e alimentação registrados na mesma data para comparar os dois históricos.');
    }

    const latestWeights = [...weightHistory]
      .filter(item => item && /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
        item.date >= cutoffKey && Number.isFinite(Number(item.weight)))
      .sort((first, second) => first.date.localeCompare(second.date));
    if (latestWeights.length && Number.isFinite(targets.targetWeight)) {
      const firstWeight = Number(latestWeights[0].weight);
      const latestWeight = Number(latestWeights[latestWeights.length - 1].weight);
      const difference = Number((latestWeight - firstWeight).toFixed(1));
      const change = difference > 0 ? `subiu ${difference} kg` : difference < 0 ? `caiu ${Math.abs(difference)} kg` : 'não variou';
      const targetDifference = Number((latestWeight - targets.targetWeight).toFixed(1));
      const targetStatus = Math.abs(targetDifference) < 0.1
        ? 'está na meta'
        : `${Math.abs(targetDifference)} kg ${targetDifference > 0 ? 'acima' : 'abaixo'} da meta`;
      insights.push(`O peso ${change} no período registrado e está ${targetStatus} de ${targets.targetWeight} kg.`);
    } else {
      insights.push('Registre seu peso para comparar a tendência recente com a meta definida no perfil.');
    }

    const currentVolume = [...volumeByDate]
      .filter(([date]) => date >= cutoffKey)
      .reduce((sum, [, volume]) => sum + volume, 0);
    const previousCutoff = new Date();
    previousCutoff.setDate(previousCutoff.getDate() - 59);
    const previousCutoffKey = getLocalDateKey(previousCutoff);
    const previousVolume = [...volumeByDate]
      .filter(([date]) => date >= previousCutoffKey && date < cutoffKey)
      .reduce((sum, [, volume]) => sum + volume, 0);
    if (currentVolume > 0 && previousVolume > 0) {
      const changePercent = Math.round((currentVolume - previousVolume) / previousVolume * 100);
      const direction = changePercent > 0 ? 'aumentou' : changePercent < 0 ? 'diminuiu' : 'permaneceu igual';
      insights.push(`O volume registrado ${direction} ${Math.abs(changePercent)}% neste período em relação aos 30 dias anteriores.`);
    }

    insight.textContent = `${insights.join('\n')}\nAs calorias gastas no treino são estimativas gerais, não medidas individuais.`;
  }

  function loadMealPlans(goal) {
    let savedPlans = {};
    try {
      savedPlans = JSON.parse(localStorage.getItem(mealPlanStorageKey) || '{}');
    } catch {
      savedPlans = {};
    }

    const goalPlans = savedPlans[goal] || {};
    return mealDefaults.map(meal => {
      const savedMeal = goalPlans[meal.id] || {};
      const foods = Array.isArray(savedMeal.foods)
        ? savedMeal.foods.filter(food => typeof food === 'string')
        : [...dietMenus[goal][meal.id]];
      const foodAmounts = Array.isArray(savedMeal.foodAmounts)
        ? savedMeal.foodAmounts.map(amount => typeof amount === 'number' && Number.isFinite(amount) ? amount : null)
        : [];
      const foodNutrition = Array.isArray(savedMeal.foodNutrition)
        ? savedMeal.foodNutrition.map(item =>
          item?.source === 'USDA FoodData Central' ? null : item
        )
        : [];
      return {
        ...meal,
        foods,
        foodAmounts,
        foodNutrition,
        calories: calculateSavedMealCalories(foodAmounts, foodNutrition)
      };
    });
  }

  function saveMealPlans() {
    let allPlans = {};
    try {
      allPlans = JSON.parse(localStorage.getItem(mealPlanStorageKey) || '{}');
      allPlans[activeDietGoal] = Object.fromEntries(mealPlans.map(meal => [meal.id, {
        foods: meal.foods,
        foodAmounts: meal.foodAmounts || [],
        foodNutrition: meal.foodNutrition || [],
        calories: meal.calories
      }]));
      localStorage.setItem(mealPlanStorageKey, JSON.stringify(allPlans));
      const feedback = document.getElementById('meal-save-feedback');
      if (feedback) {
        syncUserData('mealPlans', allPlans, feedback, 'Refeição salva e sincronizada com sua conta.');
      } else {
        window.lifeFitCloudSync?.save('mealPlans', allPlans).catch(error => {
          console.error('Não foi possível sincronizar o plano alimentar com o Firebase:', error);
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  function renderMealCards() {
    mealsList.innerHTML = mealPlans.map(meal => `
      <button class="meal-card" type="button" data-meal-id="${meal.id}">
        <span class="meal-card-heading">
          <img src="${meal.image}" alt="">
          <span class="meal-info">
            <span class="meal-time"><i class="fa-regular fa-clock" aria-hidden="true"></i> ${meal.time}</span>
            <span class="meal-card-title">${escapeMealText(meal.title)}</span>
          </span>
        </span>
        <span class="meal-description">${meal.foods.map(escapeMealText).join(', ')}</span>
        <span class="meal-card-footer">
          <span class="meal-calories">${meal.calories == null ? 'Calcule os ingredientes' : `~${meal.calories} kcal`}</span>
          <span class="meal-card-action">Editar refeição <i class="fa-solid fa-arrow-right meal-card-arrow" aria-hidden="true"></i></span>
        </span>
      </button>`).join('');

    mealsList.querySelectorAll('[data-meal-id]').forEach(button => {
      button.addEventListener('click', () => openMealDetail(button.dataset.mealId));
    });
  }

  function recordMealConsumption(meal, feedback) {
    const rows = [...mealDetailContent.querySelectorAll('.meal-food-row')];
    const foodRecords = rows.map(row => {
      const nameInput = row.querySelector('[data-meal-food]');
      const amountInput = row.querySelector('[data-meal-amount]');
      return {
        name: nameInput.value.trim(),
        quantityGrams: Number(amountInput.value),
        ...readFoodNutrition(nameInput)
      };
    });
    if (!foodRecords.length || foodRecords.some((food, index) => {
      const amountInput = rows[index].querySelector('[data-meal-amount]');
      return !food.name || !amountInput.validity.valid ||
        parseOptionalNutrient(food.kcalPer100g) === null;
    })) {
      feedback.textContent = 'Informe o alimento e a quantidade consumida e busque as calorias de cada item antes de registrar.';
      feedback.className = 'meal-save-error';
      return;
    }
    const totals = calculateMealNutrition(
      foodRecords.map(food => food.quantityGrams),
      foodRecords
    );
    const date = getLocalDateKey(new Date());
    if (calorieIntake.some(item => item.date === date && item.mealId === meal.id)) {
      feedback.textContent = 'Esta refeição já foi registrada como consumida hoje.';
      feedback.className = 'meal-save-error';
      return;
    }
    calorieIntake.push({
      date,
      mealId: meal.id,
      title: meal.title,
      calories: totals.calories,
      protein: totals.protein,
      carbohydrates: totals.carbohydrates,
      fat: totals.fat,
      foods: foodRecords,
      createdAt: new Date().toISOString()
    });
    calorieIntake = calorieIntake.slice(-500);
    if (writeDietCollection('calorieIntake', calorieIntakeStorageKey, calorieIntake, feedback, 'Consumo registrado e sincronizado com sua conta.')) {
      feedback.textContent = 'Consumo de hoje registrado neste navegador; sincronizando com o Firebase...';
      feedback.className = 'meal-save-success';
      renderDietAnalytics();
    }
  }

  function renderMealFoodFields(foods, amounts = [], nutrition = []) {
    const fields = mealDetailContent.querySelector('#meal-food-fields');
    fields.innerHTML = foods.map((food, index) => `
      <div class="meal-food-row">
        <div class="meal-food-main">
          <label for="meal-food-${index}">Alimento ou produto ${index + 1}</label>
          <input id="meal-food-${index}" type="text" value="${escapeMealText(food)}" placeholder="Ex.: arroz cozido" data-meal-food>
          <button class="meal-nutrition-search" type="button" data-nutrition-search="${index}">Buscar calorias</button>
          <select class="meal-nutrition-match" data-nutrition-match="${index}" aria-label="Produto nutricional encontrado" hidden></select>
          <small class="meal-food-nutrition" data-food-nutrition="${index}">${nutrition[index]?.productName
            ? `${escapeMealText(nutrition[index].productName)} · ${nutrition[index].kcalPer100g} kcal/100 g`
            : 'Busque o alimento na base nutricional para calcular.'}</small>
        </div>
        <div class="meal-food-quantity">
          <label for="meal-food-amount-${index}">Quantidade (g)</label>
          <input id="meal-food-amount-${index}" type="number" min="1" step="1" inputmode="decimal" value="${amounts[index] ?? ''}" placeholder="Ex.: 100" data-meal-amount="${index}">
          <small data-food-calories="${index}">Calorias: —</small>
          <small data-food-macros="${index}">Proteínas, carboidratos e gorduras: —</small>
        </div>
        <button class="meal-remove-food" type="button" data-remove-food="${index}" title="Remover alimento" aria-label="Remover alimento ${index + 1}">
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>`).join('');

    fields.querySelectorAll('[data-remove-food]').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.removeFood);
        const currentFoods = [...fields.querySelectorAll('[data-meal-food]')].map(input => input.value);
        const currentAmounts = [...fields.querySelectorAll('[data-meal-amount]')].map(input => input.value);
        const currentNutrition = [...fields.querySelectorAll('[data-meal-food]')].map(readFoodNutrition);
        currentFoods.splice(index, 1);
        currentAmounts.splice(index, 1);
        currentNutrition.splice(index, 1);
        renderMealFoodFields(currentFoods, currentAmounts, currentNutrition);
        updateMealCalorieTotal();
      });
    });

    fields.querySelectorAll('[data-meal-food]').forEach((input, index) => {
      const savedNutrition = nutrition[index];
      if (savedNutrition?.productName && parseOptionalNutrient(savedNutrition.kcalPer100g) !== null) {
        input.dataset.productName = savedNutrition.productName;
        input.dataset.kcalPer100g = savedNutrition.kcalPer100g;
        input.dataset.proteinPer100g = savedNutrition.proteinPer100g ?? '';
        input.dataset.carbohydratesPer100g = savedNutrition.carbohydratesPer100g ?? '';
        input.dataset.fatPer100g = savedNutrition.fatPer100g ?? '';
        input.dataset.source = savedNutrition.source || 'Open Food Facts';
      }
      input.addEventListener('input', () => {
        delete input.dataset.productName;
        delete input.dataset.kcalPer100g;
        delete input.dataset.proteinPer100g;
        delete input.dataset.carbohydratesPer100g;
        delete input.dataset.fatPer100g;
        delete input.dataset.source;
        fields.querySelector(`[data-nutrition-match="${index}"]`).hidden = true;
        fields.querySelector(`[data-food-nutrition="${index}"]`).textContent =
          'Nome alterado; busque novamente para atualizar as calorias.';
        updateMealCalorieTotal();
      });
    });

    fields.querySelectorAll('[data-meal-amount]').forEach(input => {
      input.addEventListener('input', updateMealCalorieTotal);
    });

    fields.querySelectorAll('[data-nutrition-search]').forEach(button => {
      button.addEventListener('click', () => searchMealFood(button));
    });

    updateMealCalorieTotal();
  }

  function updateMealCalorieTotal() {
    const totalElement = mealDetailContent.querySelector('#meal-calorie-total');
    if (!totalElement) return;

    const rows = [...mealDetailContent.querySelectorAll('.meal-food-row')];
    const quantities = [];
    const nutrients = [];
    rows.forEach((row, index) => {
      const foodInput = row.querySelector('[data-meal-food]');
      const amountInput = row.querySelector('[data-meal-amount]');
      const amount = Number(amountInput.value);
      quantities.push(amount);
      nutrients.push({
        kcalPer100g: parseOptionalNutrient(foodInput.dataset.kcalPer100g),
        proteinPer100g: parseOptionalNutrient(foodInput.dataset.proteinPer100g),
        carbohydratesPer100g: parseOptionalNutrient(foodInput.dataset.carbohydratesPer100g),
        fatPer100g: parseOptionalNutrient(foodInput.dataset.fatPer100g)
      });
      const kcalPer100g = parseOptionalNutrient(foodInput.dataset.kcalPer100g);
      const itemCalories = kcalPer100g === null ? null : kcalPer100g * amount / 100;
      if (!Number.isFinite(itemCalories) || amount <= 0) {
        row.querySelector(`[data-food-calories="${index}"]`).textContent = 'Calorias: —';
        row.querySelector(`[data-food-macros="${index}"]`).textContent = 'Proteínas, carboidratos e gorduras: —';
      } else {
        row.querySelector(`[data-food-calories="${index}"]`).textContent = `Calorias: ${Math.round(itemCalories)} kcal`;
        const macros = calculateMealNutrition([amount], [nutrients[index]]);
        row.querySelector(`[data-food-macros="${index}"]`).textContent =
          macros.protein === null || macros.carbohydrates === null || macros.fat === null
            ? 'Macros indisponíveis nesta fonte'
            : `P ${macros.protein} g · C ${macros.carbohydrates} g · G ${macros.fat} g`;
      }
    });

    const totals = calculateMealNutrition(quantities, nutrients);
    const complete = rows.length > 0 && totals.calories !== null;
    totalElement.textContent = complete
      ? `Total estimado: ${totals.calories} kcal${totals.protein !== null && totals.carbohydrates !== null && totals.fat !== null
        ? ` · P ${totals.protein} g · C ${totals.carbohydrates} g · G ${totals.fat} g`
        : ' · macros indisponíveis para alguns itens'}`
      : 'Informe a quantidade em gramas e busque cada alimento para calcular o total.';
    totalElement.dataset.total = complete ? String(totals.calories) : '';
  }

  async function searchMealFood(button) {
    const index = Number(button.dataset.nutritionSearch);
    const row = button.closest('.meal-food-row');
    const foodInput = row.querySelector('[data-meal-food]');
    const matchSelect = row.querySelector(`[data-nutrition-match="${index}"]`);
    const nutritionLabel = row.querySelector(`[data-food-nutrition="${index}"]`);
    const query = foodInput.value.trim();
    if (!query) {
      foodInput.focus();
      nutritionLabel.textContent = 'Informe o nome do alimento ou produto para buscar.';
      return;
    }

    const normalizedQuery = query.toLocaleLowerCase('pt-BR');
    const cachedProducts = nutritionSearchCache.get(normalizedQuery);
    const requestKey = 'lifefit_nutrition_api_requests';
    const now = Date.now();
    let requestTimes = [];
    try {
      requestTimes = JSON.parse(localStorage.getItem(requestKey) || '[]');
      if (!Array.isArray(requestTimes)) requestTimes = [];
    } catch (error) {
      console.error('Não foi possível ler o limite local de consultas nutricionais:', error);
    }
    requestTimes = requestTimes.filter(timestamp => Number.isFinite(timestamp) && now - timestamp < 60000);
    if (!cachedProducts && requestTimes.length >= 8) {
      nutritionLabel.textContent = 'Limite local de buscas atingido. Aguarde um minuto antes de consultar novamente.';
      return;
    }

    button.disabled = true;
    button.textContent = 'Buscando...';
    nutritionLabel.textContent = cachedProducts
      ? 'Usando resultado nutricional salvo nesta sessão...'
      : 'Consultando a base nutricional online...';
    try {
      let products = cachedProducts;
      if (!products) {
        localStorage.setItem(requestKey, JSON.stringify([...requestTimes, now]));
        const params = new URLSearchParams({
          search_terms: query,
          search_simple: '1',
          action: 'process',
          json: '1',
          page_size: '5',
          fields: 'product_name,nutriments'
        });
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`);
        if (!response.ok) throw new Error(`A base nutricional respondeu com status ${response.status}.`);
        const result = await response.json();
        products = (Array.isArray(result.products) ? result.products : [])
          .map(product => ({
            productName: product.product_name,
            kcalPer100g: parseOptionalNutrient(product.nutriments?.['energy-kcal_100g'] ?? product.nutriments?.['energy-kcal']),
            proteinPer100g: parseOptionalNutrient(product.nutriments?.proteins_100g),
            carbohydratesPer100g: parseOptionalNutrient(product.nutriments?.carbohydrates_100g),
            fatPer100g: parseOptionalNutrient(product.nutriments?.fat_100g),
            source: 'Open Food Facts'
          }))
          .filter(product => typeof product.productName === 'string' &&
            product.productName.trim() &&
            product.kcalPer100g !== null &&
            product.kcalPer100g > 0);
        nutritionSearchCache.set(normalizedQuery, products);
      }

      if (!products.length) {
        matchSelect.hidden = true;
        nutritionLabel.textContent = 'Não encontramos calorias para esse alimento. Tente um nome mais específico ou uma marca.';
        delete foodInput.dataset.productName;
        delete foodInput.dataset.kcalPer100g;
        delete foodInput.dataset.proteinPer100g;
        delete foodInput.dataset.carbohydratesPer100g;
        delete foodInput.dataset.fatPer100g;
        delete foodInput.dataset.source;
        updateMealCalorieTotal();
        return;
      }

      matchSelect.replaceChildren();
      products.forEach((product, productIndex) => {
        const option = document.createElement('option');
        option.value = String(productIndex);
        option.textContent = `${product.productName} — ${product.kcalPer100g} kcal/100 g`;
        matchSelect.append(option);
      });
      matchSelect.hidden = false;

      const applySelectedProduct = () => {
        const selectedProduct = products[Number(matchSelect.value)];
        if (!selectedProduct) return;
        foodInput.dataset.productName = selectedProduct.productName;
        foodInput.dataset.kcalPer100g = String(selectedProduct.kcalPer100g);
        foodInput.dataset.proteinPer100g = selectedProduct.proteinPer100g ?? '';
        foodInput.dataset.carbohydratesPer100g = selectedProduct.carbohydratesPer100g ?? '';
        foodInput.dataset.fatPer100g = selectedProduct.fatPer100g ?? '';
        foodInput.dataset.source = selectedProduct.source;
        nutritionLabel.textContent = `Base: ${selectedProduct.productName} · ${selectedProduct.kcalPer100g} kcal/100 g`;
        updateMealCalorieTotal();
      };
      matchSelect.onchange = applySelectedProduct;
      applySelectedProduct();
    } catch (error) {
      console.error('Não foi possível consultar a base nutricional:', error);
      nutritionLabel.textContent = 'Falha ao consultar a base online. Verifique a conexão e tente novamente.';
    } finally {
      button.disabled = false;
      button.textContent = 'Buscar calorias';
    }
  }

  function openMealDetail(mealId) {
    const meal = mealPlans.find(item => item.id === mealId);
    if (!meal) return;

    mealDetailContent.innerHTML = `
      <header class="meal-detail-overview">
        <span class="meal-detail-icon" aria-hidden="true"><i class="fa-solid fa-utensils"></i></span>
        <div class="meal-detail-header">
          <span class="meal-detail-kicker">SUA REFEIÇÃO · ${meal.time}</span>
          <h2>${escapeMealText(meal.title)}</h2>
          <p>${meal.calories == null ? 'Calorias não calculadas' : `~${meal.calories} kcal estimadas`}</p>
        </div>
      </header>
      <form id="meal-editor-form" class="meal-editor-form">
        <section class="meal-editor-panel">
          <div class="meal-editor-heading">
            <div><span class="meal-editor-kicker">INGREDIENTES</span><h3>Alimentos da refeição</h3></div>
            <button class="meal-add-food" id="btn-add-food" type="button">
              <i class="fa-solid fa-plus" aria-hidden="true"></i> Adicionar alimento
            </button>
          </div>
          <p class="meal-calorie-total" id="meal-calorie-total" aria-live="polite"></p>
          <p class="meal-nutrition-disclaimer">Estimativa por alimento com base no <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer">Open Food Facts</a>, uma base colaborativa. Confirme o produto, a porção em gramas e as informações do rótulo.</p>
          <div id="meal-food-fields" class="meal-food-fields"></div>
        </section>
        <footer class="meal-detail-footer">
          <div class="meal-save-row">
            <div class="meal-save-message"><span class="meal-save-icon" aria-hidden="true"><i class="fa-solid fa-shield-halved"></i></span><p id="meal-save-feedback" aria-live="polite">Edite a lista conforme sua refeição.</p></div>
            <button class="btn-secondary" id="log-meal-consumption" type="button">Registrar como consumida hoje</button>
            <button class="btn-primary" type="submit"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Salvar refeição</button>
          </div>
        </footer>
      </form>`;

    renderMealFoodFields(meal.foods, meal.foodAmounts, meal.foodNutrition);
    const loggedToday = calorieIntake.some(item =>
      item.date === getLocalDateKey(new Date()) && item.mealId === meal.id
    );
    const consumptionButton = document.getElementById('log-meal-consumption');
    consumptionButton.disabled = loggedToday;
    consumptionButton.textContent = loggedToday ? 'Refeição já registrada hoje' : 'Registrar como consumida hoje';
    document.getElementById('log-meal-consumption').addEventListener('click', () => {
      recordMealConsumption(meal, mealDetailContent.querySelector('#meal-save-feedback'));
    });
    document.getElementById('btn-add-food').addEventListener('click', () => {
      const fields = mealDetailContent.querySelector('#meal-food-fields');
      const currentFoods = [...fields.querySelectorAll('[data-meal-food]')].map(input => input.value);
      const currentAmounts = [...fields.querySelectorAll('[data-meal-amount]')].map(input => input.value);
      const currentNutrition = [...fields.querySelectorAll('[data-meal-food]')].map(readFoodNutrition);
      currentFoods.push('');
      currentAmounts.push('');
      currentNutrition.push(null);
      renderMealFoodFields(currentFoods, currentAmounts, currentNutrition);
      fields.querySelectorAll('[data-meal-food]').item(currentFoods.length - 1)?.focus();
    });

    document.getElementById('meal-editor-form').addEventListener('submit', event => {
      event.preventDefault();
      const foodInputs = [...mealDetailContent.querySelectorAll('[data-meal-food]')]
        .filter(input => input.value.trim());
      const foods = foodInputs.map(input => input.value.trim());
      const foodAmounts = foodInputs.map(input => {
        const amount = input.closest('.meal-food-row').querySelector('[data-meal-amount]').value;
        return amount === '' ? null : Number(amount);
      });
      const foodNutrition = foodInputs.map(readFoodNutrition);
      const feedback = mealDetailContent.querySelector('#meal-save-feedback');

      if (!foods.length) {
        feedback.textContent = 'Adicione pelo menos um alimento antes de salvar.';
        feedback.className = 'meal-save-error';
        return;
      }
      const invalidAmount = foodInputs
        .map(input => input.closest('.meal-food-row').querySelector('[data-meal-amount]'))
        .find(input => input.value !== '' && !input.validity.valid);
      if (invalidAmount) {
        invalidAmount.reportValidity();
        return;
      }

      meal.foods = foods;
      meal.foodAmounts = foodAmounts;
      meal.foodNutrition = foodNutrition;
      const totalElement = mealDetailContent.querySelector('#meal-calorie-total');
      meal.calories = totalElement.dataset.total ? Number(totalElement.dataset.total) : null;
      const saved = saveMealPlans();
      feedback.textContent = saved
        ? meal.calories === null
          ? 'Refeição salva. Calcule todos os alimentos para obter o total de calorias.'
          : 'Refeição e calorias estimadas salvas neste dispositivo.'
        : 'Não foi possível salvar neste navegador.';
      feedback.className = saved ? 'meal-save-success' : 'meal-save-error';
      if (saved) renderMealCards();
    });

    dietPlanOverview.hidden = true;
    mealDetail.hidden = false;
    updatePageTitle('diet');
    mealDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeMealDetail() {
    if (!mealDetail) return;
    mealDetail.hidden = true;
    dietPlanOverview.hidden = false;
  }

  function readDietProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem(dietProfileStorageKey) || 'null');
      if (!profile || !dietMenus[profile.goal]) return null;
      if (!Number.isFinite(profile.weight) || !Number.isFinite(profile.height) || !Number.isFinite(profile.age)) return null;
      if (!['female', 'male', 'unspecified'].includes(profile.sex)) return null;
      return profile;
    } catch {
      return null;
    }
  }

  function renderDietPlan(profile) {
    dietProfile = profile;
    activeDietGoal = profile.goal;
    mealPlans = loadMealPlans(activeDietGoal);
    dietGoalSelect.value = activeDietGoal;
    dietPlanGoalEl.textContent = dietGoalTitles[activeDietGoal];
    dietGoalGuidanceEl.textContent = dietGoalGuidance[activeDietGoal];

    const heightInMeters = profile.height / 100;
    const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    const sexLabel = { female: 'feminino', male: 'masculino', unspecified: 'sexo não informado' }[profile.sex];
    const waterRates = profile.age >= 65 ? [25, 30] : [30, 35];
    const waterMinimum = (profile.weight * waterRates[0] / 1000).toFixed(1);
    const waterMaximum = (profile.weight * waterRates[1] / 1000).toFixed(1);

    document.getElementById('hydration-context').textContent = `${profile.weight} kg · ${profile.height} cm · ${profile.age} anos · perfil ${sexLabel} · IMC ${bmi}`;
    document.getElementById('hydration-target').textContent = `${waterMinimum} a ${waterMaximum} L por dia`;
    document.getElementById('diet-profile-step').hidden = true;
    document.getElementById('diet-plan-view').hidden = false;
    dietPlanOverview.hidden = false;
    mealDetail.hidden = true;
    renderMealCards();
    const latestWeight = [...weightHistory].sort((first, second) => second.date.localeCompare(first.date))[0];
    document.getElementById('weight-entry-value').value = latestWeight?.weight ?? profile.weight;
    renderDietAnalytics();
  }

  if (dietProfileForm) {
    dietProfileForm.addEventListener('submit', event => {
      event.preventDefault();
      const profile = {
        weight: Number(document.getElementById('diet-weight').value),
        height: Number(document.getElementById('diet-height').value),
        age: Number(document.getElementById('diet-age').value),
        sex: document.getElementById('diet-sex').value,
        goal: dietGoalSelect.value
      };

      if (!dietMenus[profile.goal]) return;
      try {
        localStorage.setItem(dietProfileStorageKey, JSON.stringify(profile));
      } catch {
        document.getElementById('diet-profile-error').textContent = 'Não foi possível salvar o perfil neste navegador; o plano ficará disponível nesta sessão.';
      }
      renderDietPlan(profile);
      window.lifeFitCloudSync?.save('dietProfile', profile).then(() => {
        const status = document.getElementById('diet-profile-error');
        status.textContent = 'Perfil alimentar sincronizado com sua conta.';
        status.className = 'diet-profile-success';
      }).catch(error => {
        console.error('Não foi possível sincronizar o perfil alimentar com o Firebase:', error);
        const status = document.getElementById('diet-profile-error');
        status.textContent = 'Perfil salvo neste navegador, mas não sincronizado com o Firebase. Verifique sua conta, conexão e permissões.';
        status.className = 'diet-profile-error';
      });
    });

    document.getElementById('diet-goals-form').addEventListener('submit', event => {
      event.preventDefault();
      const targetWeight = Number(document.getElementById('diet-target-weight').value);
      const dailyCalories = Number(document.getElementById('diet-target-calories').value);
      const status = document.getElementById('diet-goals-status');
      if (!Number.isFinite(targetWeight) || targetWeight < 25 || targetWeight > 350 ||
          !Number.isFinite(dailyCalories) || dailyCalories < 500 || dailyCalories > 10000) {
        status.textContent = 'Informe uma meta de peso entre 25 e 350 kg e uma meta calórica entre 500 e 10.000 kcal.';
        status.className = 'diet-profile-error';
        return;
      }
      dietGoals = { targetWeight, dailyCalories, updatedAt: new Date().toISOString() };
      if (writeDietCollection('dietGoals', dietGoalsStorageKey, dietGoals, status, 'Metas salvas e sincronizadas com sua conta.')) {
        renderDietAnalytics();
      }
    });

    document.getElementById('weight-entry-form').addEventListener('submit', event => {
      event.preventDefault();
      const input = document.getElementById('weight-entry-value');
      const weight = Number(input.value);
      const status = document.getElementById('weight-entry-status');
      if (!Number.isFinite(weight) || weight < 25 || weight > 350) {
        status.textContent = 'Informe um peso entre 25 e 350 kg.';
        status.className = 'diet-profile-error';
        return;
      }
      const date = getLocalDateKey(new Date());
      const todayRecord = weightHistory.findIndex(item => item.date === date);
      const record = { date, weight, recordedAt: new Date().toISOString() };
      if (todayRecord >= 0) weightHistory[todayRecord] = record;
      else weightHistory.push(record);
      weightHistory = weightHistory.slice(-500);
      if (writeDietCollection('weightHistory', weightHistoryStorageKey, weightHistory, status, 'Peso registrado e sincronizado com sua conta.')) {
        renderDietAnalytics();
      }
    });

    document.getElementById('btn-edit-diet-profile').addEventListener('click', () => {
      if (dietProfile) {
        document.getElementById('diet-weight').value = dietProfile.weight;
        document.getElementById('diet-height').value = dietProfile.height;
        document.getElementById('diet-age').value = dietProfile.age;
        document.getElementById('diet-sex').value = dietProfile.sex;
        dietGoalSelect.value = dietProfile.goal;
      }
      document.getElementById('diet-profile-step').hidden = false;
      document.getElementById('diet-plan-view').hidden = true;
      dietProfileForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    dietProfile = readDietProfile();
    if (dietProfile) {
      renderDietPlan(dietProfile);
    } else {
      dietProfileStep.hidden = false;
      dietPlanView.hidden = true;
    }

    document.getElementById('btn-back-meals').addEventListener('click', () => {
      closeMealDetail();
      updatePageTitle('diet');
    });
  }

  function setPageTitle(title) {
    pageTitle.innerText = title;
    document.title = `${title} | Life Fit`;
  }

  function updatePageTitle(tab) {
    const title = tabTitles[tab];
    if (!title) return;

    setPageTitle(title);
  }

  const initialTab = document.querySelector('.nav-link.active')?.getAttribute('data-tab');
  updatePageTitle(initialTab);

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeWorkoutDetail();
      closeMealDetail();
      
      const targetTab = link.getAttribute('data-tab');

      // Remove ativa de todos
      navLinks.forEach(l => l.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      // Ativa o selecionado
      link.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');

      updatePageTitle(targetTab);
    });
  });

  // ========================================================
  // 2. SISTEMA INTERATIVO DE OFENSIVA (STREAK)
  // ========================================================
  const btnCheckin = document.getElementById('btn-checkin');
  const streakNum = document.getElementById('streak-num');
  const streakUnit = document.getElementById('streak-unit');
  const trainingDaysKey = 'ritual_training_days';
  const calendarDialog = document.getElementById('streak-calendar-dialog');
  const calendarGrid = document.getElementById('streak-calendar-grid');
  const calendarMonthLabel = document.getElementById('streak-calendar-month-label');
  const calendarTrigger = document.getElementById('streak-calendar-trigger');
  const sessionUser = activeSessionUser;
  const userTrainingDaysKey = userStorageKey(trainingDaysKey);
  let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  function getLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function loadTrainingDays() {
    const savedDays = JSON.parse(localStorage.getItem(userTrainingDaysKey) || '[]');
    if (!Array.isArray(savedDays) || savedDays.some(day => typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day))) {
      throw new Error('O histórico de treinos salvo neste navegador está inválido.');
    }

    return new Set(savedDays);
  }

  function getCurrentStreak(trainingDays) {
    const today = new Date();
    const todayKey = getLocalDateKey(today);
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const yesterdayKey = getLocalDateKey(yesterday);
    const lastDay = trainingDays.has(todayKey) ? todayKey : yesterdayKey;

    if (!trainingDays.has(lastDay)) return 0;

    let streak = 0;
    const date = new Date(`${lastDay}T00:00:00`);
    while (trainingDays.has(getLocalDateKey(date))) {
      streak += 1;
      date.setDate(date.getDate() - 1);
    }
    return streak;
  }

  let trainingDays;
  try {
    trainingDays = loadTrainingDays();
  } catch (error) {
    console.error('Não foi possível carregar os dias de treino:', error);
    trainingDays = new Set();
    btnCheckin.disabled = true;
    calendarTrigger.disabled = true;
    alert('Não foi possível carregar seu histórico de treinos salvo neste navegador.');
  }

  function updateStreakUI() {
    const todayKey = getLocalDateKey(new Date());
    const didTrainToday = trainingDays.has(todayKey);
    const currentStreak = getCurrentStreak(trainingDays);
    streakNum.innerText = currentStreak;
    streakUnit.innerText = currentStreak === 1 ? 'dia' : 'dias';
    btnCheckin.innerText = didTrainToday ? 'Treino registrado' : 'Registrar treino';
    btnCheckin.classList.toggle('done', didTrainToday);
    btnCheckin.disabled = didTrainToday;
  }

  const notificationDialog = document.getElementById('notification-dialog');
  const notificationTrigger = document.getElementById('notification-trigger');
  const notificationList = document.getElementById('notification-list');
  const notificationCount = document.getElementById('notification-count');
  const notificationEmpty = document.getElementById('notification-empty');
  const notificationDismissedKey = userStorageKey('lifefit_dismissed_notifications');
  let dismissedNotifications = new Set();
  let notificationCloudData = window.lifeFitCloudData || {};

  try {
    const storedDismissed = JSON.parse(localStorage.getItem(notificationDismissedKey) || '[]');
    if (!Array.isArray(storedDismissed) || storedDismissed.some(id => typeof id !== 'string')) {
      throw new Error('A lista de notificações dispensadas está inválida.');
    }
    dismissedNotifications = new Set(storedDismissed);
  } catch (error) {
    console.error('Não foi possível carregar o estado das notificações:', error);
  }

  function getNotifications() {
    const todayKey = getLocalDateKey(new Date());
    const items = [];

    if (!sessionUser?.id) {
      items.push({
        id: 'account-login-required',
        title: 'Entre na sua conta',
        message: 'Faça login para acompanhar seu perfil, suas metas e seus dados sincronizados.',
        action: 'Entrar',
        actionType: 'login'
      });
      return items;
    }

    const goals = notificationCloudData.goals;
    if (!goals || !goals.objective || !goals.trainingLevel) {
      items.push({
        id: 'profile-goals-required',
        title: 'Defina suas metas',
        message: 'Complete seu objetivo e nível de treino em Perfil & Metas para personalizar sua jornada.',
        action: 'Abrir metas',
        actionType: 'profile'
      });
    }

    if (trainingDays.has(todayKey)) {
      items.push({
        id: `workout-registered-${todayKey}`,
        title: 'Treino registrado',
        message: 'Seu treino de hoje já está no calendário. Parabéns por manter a consistência!',
        action: 'Ver calendário',
        actionType: 'calendar'
      });
    } else {
      items.push({
        id: `workout-reminder-${todayKey}`,
        title: 'Como está sua rotina hoje?',
        message: 'Se você já concluiu seu treino, registre o dia para atualizar sua ofensiva e seu histórico.',
        action: 'Registrar treino',
        actionType: 'checkin'
      });
    }

    return items;
  }

  function saveDismissedNotifications() {
    try {
      localStorage.setItem(notificationDismissedKey, JSON.stringify([...dismissedNotifications]));
      return true;
    } catch (error) {
      console.error('Não foi possível salvar o estado das notificações:', error);
      return false;
    }
  }

  function updateNotificationBadge(unreadCount) {
    notificationCount.hidden = unreadCount === 0;
    notificationCount.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
    notificationTrigger.setAttribute(
      'aria-label',
      unreadCount ? `Abrir notificações, ${unreadCount} não lidas` : 'Abrir notificações'
    );
  }

  function renderNotifications() {
    const notifications = getNotifications();
    const unreadCount = notifications.filter(item => !dismissedNotifications.has(item.id)).length;
    updateNotificationBadge(unreadCount);
    notificationEmpty.hidden = notifications.length > 0;
    notificationList.replaceChildren();

    for (const item of notifications) {
      const listItem = document.createElement('li');
      listItem.className = `notification-item${dismissedNotifications.has(item.id) ? ' read' : ''}`;

      const content = document.createElement('div');
      content.className = 'notification-content';
      const title = document.createElement('strong');
      title.textContent = item.title;
      const message = document.createElement('p');
      message.textContent = item.message;
      content.append(title, message);

      const controls = document.createElement('div');
      controls.className = 'notification-item-actions';
      const actionButton = document.createElement('button');
      actionButton.className = 'notification-action';
      actionButton.type = 'button';
      actionButton.textContent = item.action;
      actionButton.addEventListener('click', () => {
        notificationDialog.close();
        if (item.actionType === 'checkin') btnCheckin.click();
        if (item.actionType === 'calendar') calendarTrigger.click();
        if (item.actionType === 'profile') document.querySelector('.nav-link[data-tab="profile"]').click();
        if (item.actionType === 'login') {
          window.location.href = window.location.pathname.includes('/lifefit/')
            ? '../login.html'
            : 'login.html';
        }
      });

      const dismissButton = document.createElement('button');
      dismissButton.className = 'notification-dismiss';
      dismissButton.type = 'button';
      dismissButton.textContent = dismissedNotifications.has(item.id) ? 'Lida' : 'Dispensar';
      dismissButton.disabled = dismissedNotifications.has(item.id);
      dismissButton.addEventListener('click', () => {
        dismissedNotifications.add(item.id);
        if (!saveDismissedNotifications()) {
          dismissedNotifications.delete(item.id);
          return;
        }
        renderNotifications();
      });

      controls.append(actionButton, dismissButton);
      listItem.append(content, controls);
      notificationList.append(listItem);
    }
  }

  notificationTrigger.addEventListener('click', () => {
    renderNotifications();
    notificationTrigger.setAttribute('aria-expanded', 'true');
    notificationDialog.showModal();
  });

  document.getElementById('notification-close').addEventListener('click', () => notificationDialog.close());
  notificationDialog.addEventListener('close', () => notificationTrigger.setAttribute('aria-expanded', 'false'));
  document.getElementById('notification-mark-read').addEventListener('click', () => {
    getNotifications().forEach(item => dismissedNotifications.add(item.id));
    if (!saveDismissedNotifications()) return;
    renderNotifications();
  });
  notificationDialog.addEventListener('click', event => {
    if (event.target === notificationDialog) notificationDialog.close();
  });
  window.addEventListener('lifefit:cloud-data-loaded', event => {
    notificationCloudData = event.detail || {};
    renderNotifications();
  });
  window.addEventListener('lifefit:cloud-data-updated', event => {
    notificationCloudData = { ...notificationCloudData, ...event.detail };
    renderNotifications();
  });
  renderNotifications();

  function renderTrainingCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const todayKey = getLocalDateKey(new Date());
    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(firstDay);
    calendarMonthLabel.textContent = monthName.charAt(0).toLocaleUpperCase('pt-BR') + monthName.slice(1);

    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const weekdayMarkup = weekDays.map(day => `<span class="streak-calendar-weekday" role="columnheader">${day}</span>`).join('');
    const emptyCells = Array.from({ length: startOffset }, () => '<span class="streak-calendar-empty" aria-hidden="true"></span>').join('');
    const dayCells = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateKey = getLocalDateKey(new Date(year, month, day));
      const trained = trainingDays.has(dateKey);
      const isToday = dateKey === todayKey;
      return `<span class="streak-calendar-day${trained ? ' trained' : ''}${isToday ? ' today' : ''}" role="gridcell" aria-label="${day} ${monthName}${trained ? ', treino registrado' : ''}${isToday ? ', hoje' : ''}">${day}${trained ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : ''}</span>`;
    }).join('');

    calendarGrid.innerHTML = weekdayMarkup + emptyCells + dayCells;
    document.getElementById('streak-calendar-next').disabled =
      year === new Date().getFullYear() && month >= new Date().getMonth();
  }

  calendarTrigger.addEventListener('click', () => {
    renderTrainingCalendar();
    calendarDialog.showModal();
  });

  document.getElementById('streak-calendar-close').addEventListener('click', () => calendarDialog.close());
  document.getElementById('streak-calendar-prev').addEventListener('click', () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    renderTrainingCalendar();
  });
  document.getElementById('streak-calendar-next').addEventListener('click', () => {
    const currentMonth = new Date();
    if (calendarMonth.getFullYear() < currentMonth.getFullYear() ||
        calendarMonth.getMonth() < currentMonth.getMonth()) {
      calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
      renderTrainingCalendar();
    }
  });
  calendarDialog.addEventListener('click', event => {
    if (event.target === calendarDialog) calendarDialog.close();
  });

  btnCheckin.addEventListener('click', () => {
    const today = new Date();
    const todayKey = getLocalDateKey(today);
    if (!trainingDays.has(todayKey)) {
      trainingDays.add(todayKey);
      try {
        localStorage.setItem(userTrainingDaysKey, JSON.stringify([...trainingDays].sort()));
      } catch (error) {
        trainingDays.delete(todayKey);
        console.error('Não foi possível salvar o treino de hoje:', error);
        alert('Não foi possível salvar o treino neste navegador. Verifique o espaço disponível.');
        return;
      }
      window.dispatchEvent(new CustomEvent('lifefit:training-day-registered', {
        detail: { date: todayKey }
      }));
      updateStreakUI();
      renderNotifications();
      btnCheckin.style.transform = "scale(1.2)";
      setTimeout(() => btnCheckin.style.transform = "scale(1)", 200);
    }
  });

  updateStreakUI();

  const dashboardWorkoutLink = document.getElementById('dashboard-workout-link');
  if (dashboardWorkoutLink) {
    dashboardWorkoutLink.addEventListener('click', () => {
      document.querySelector('.nav-link[data-tab="workouts"]').click();
    });
  }

  const btnAddWater = document.getElementById('btn-add-water');
  const waterAmountEl = document.getElementById('water-amount');
  if (btnAddWater && waterAmountEl) {
    let currentWater = Number(waterAmountEl.innerText) || 0;
    btnAddWater.addEventListener('click', () => {
      currentWater += 0.25;
      waterAmountEl.innerText = currentWater.toFixed(2);
    });
  }

  // ========================================================
  // 4. CALCULADORA INTERATIVA DE IMC
  // ========================================================
  const imcForm = document.getElementById('imc-form');
  const imcValueEl = document.getElementById('imc-value');
  const imcClassEl = document.getElementById('imc-classification');
  const imcDetailsEl = document.getElementById('imc-details');

  imcForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const sexo = document.getElementById('sexo').value;
    const idade = parseInt(document.getElementById('idade').value, 10);
    const peso = parseFloat(document.getElementById('peso').value);
    const alturaCm = parseFloat(document.getElementById('altura').value);

    if (sexo && idade > 0 && peso > 0 && alturaCm > 0) {
      const alturaM = alturaCm / 100;
      const imc = peso / (alturaM * alturaM);

      imcValueEl.innerText = imc.toFixed(1);
      imcDetailsEl.innerText = `${idade} anos · ${sexo}`;

      let classificacao = '';
      let cor = '';

      if (idade < 20) {
        classificacao = 'A classificação para menores de 20 anos depende de curvas específicas por idade e sexo.';
        cor = '#e67e22';
      } else if (imc < 18.5) {
        classificacao = 'Abaixo do peso';
        cor = '#e67e22';
      } else if (imc < 25) {
        classificacao = 'Peso normal / Adequado';
        cor = '#2e7d32';
      } else if (imc < 30) {
        classificacao = 'Sobrepeso';
        cor = '#e67e22';
      } else {
        classificacao = 'Obesidade';
        cor = '#c0392b';
      }

      imcClassEl.innerText = classificacao;
      imcClassEl.style.color = cor;
      imcClassEl.style.fontWeight = '800';

      const bodyMetrics = {
        sex: sexo,
        age: idade,
        weight: peso,
        height: alturaCm,
        bmi: Number(imc.toFixed(1)),
        classification: classificacao,
        updatedAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(userStorageKey('lifefit_body_metrics'), JSON.stringify(bodyMetrics));
      } catch (error) {
        console.error('Não foi possível salvar os dados do IMC neste navegador:', error);
      }
      const feedback = document.getElementById('body-metrics-sync-status');
      if (feedback) {
        syncUserData('bodyMetrics', bodyMetrics, feedback, 'Resultado e medidas sincronizados com sua conta.');
      } else {
        window.lifeFitCloudSync?.save('bodyMetrics', bodyMetrics).catch(error => {
          console.error('Não foi possível sincronizar as medidas com o Firebase:', error);
        });
      }
    }
  });

  function applyCloudData(data) {
    if (Object.prototype.hasOwnProperty.call(data, 'dietProfile') && data.dietProfile) {
      dietProfile = data.dietProfile;
      if (dietProfile && dietProfileForm) {
        document.getElementById('diet-weight').value = dietProfile.weight;
        document.getElementById('diet-height').value = dietProfile.height;
        document.getElementById('diet-age').value = dietProfile.age;
        document.getElementById('diet-sex').value = dietProfile.sex;
        dietGoalSelect.value = dietProfile.goal;
        renderDietPlan(dietProfile);
      }
    }

    if (Array.isArray(data.trainingDays)) {
      trainingDays = new Set(data.trainingDays);
      updateStreakUI();
      if (calendarDialog.open) renderTrainingCalendar();
      renderWorkoutDietInsight();
    }

    if (data.bodyMetrics && typeof data.bodyMetrics === 'object') {
      const metrics = data.bodyMetrics;
      document.getElementById('sexo').value = metrics.sex || '';
      document.getElementById('idade').value = metrics.age ?? '';
      document.getElementById('peso').value = metrics.weight ?? '';
      document.getElementById('altura').value = metrics.height ?? '';
      imcValueEl.textContent = Number.isFinite(metrics.bmi) ? metrics.bmi.toFixed(1) : '--.-';
      imcClassEl.textContent = metrics.classification || 'Preencha o formulário para calcular.';
      imcDetailsEl.textContent = Number.isFinite(metrics.age) && metrics.sex
        ? `${metrics.age} anos · ${metrics.sex}`
        : '';
      localStorage.setItem(userStorageKey('lifefit_body_metrics'), JSON.stringify(metrics));
    }

    if (data.dietGoals && typeof data.dietGoals === 'object' && !Array.isArray(data.dietGoals)) {
      dietGoals = data.dietGoals;
      localStorage.setItem(dietGoalsStorageKey, JSON.stringify(dietGoals));
      renderDietAnalytics();
    }

    if (Array.isArray(data.calorieIntake)) {
      calorieIntake = data.calorieIntake.filter(item =>
        item && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(Number(item.calories))
      );
      localStorage.setItem(calorieIntakeStorageKey, JSON.stringify(calorieIntake));
      renderDietAnalytics();
    }

    if (Array.isArray(data.weightHistory)) {
      weightHistory = data.weightHistory.filter(item =>
        item && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(Number(item.weight))
      );
      localStorage.setItem(weightHistoryStorageKey, JSON.stringify(weightHistory));
      renderDietAnalytics();
    }

    if (data.workoutHistory && typeof data.workoutHistory === 'object' && !Array.isArray(data.workoutHistory)) {
      localStorage.setItem(workoutProgressKey, JSON.stringify(data.workoutHistory));
      renderWorkoutVolumeChart(data.workoutHistory);
      renderWorkoutDietInsight();
    }
  }

  renderWorkoutVolumeChart();
  window.addEventListener('lifefit:cloud-data-loaded', event => applyCloudData(event.detail));
  window.addEventListener('lifefit:cloud-data-updated', event => applyCloudData(event.detail));
  if (window.lifeFitCloudData) applyCloudData(window.lifeFitCloudData);

});

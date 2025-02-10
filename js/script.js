document.addEventListener('DOMContentLoaded', async () => {
	const generateBtn = document.getElementById('generate-wod');
	const wodContainer = document.getElementById('wod-container');

	async function fetchWodData() {
		try {
			const response = await fetch('wod-data.json');
			if (!response.ok)
				throw new Error('Erreur lors du chargement du JSON');
			return await response.json();
		} catch (error) {
			console.error('Erreur de chargement des données WOD :', error);
			return null;
		}
	}

	function getRandomElement(array) {
		if (!Array.isArray(array) || array.length === 0) {
			console.warn(
				'⚠️ Tentative de tirage aléatoire sur un tableau vide ou non défini.',
				array
			);
			return 'N/A';
		}
		return array[Math.floor(Math.random() * array.length)];
	}

	function getRandomTraining(strengthCategory) {
		const movement = getRandomElement(strengthCategory.movements);
		const types = strengthCategory.types;

		let trainingTypes = {};
		Object.keys(types).forEach((type) => {
			trainingTypes[type] = {
				sets: types[type].sets,
				reps: getRandomElement(types[type].reps),
			};
		});

		return { movement, trainingTypes };
	}

	function getRandomPreWOD(preWODCategory) {
		if (!preWODCategory) return null;

		const compoundList = preWODCategory.compound || [];
		const accessoryList = preWODCategory.accessory || [];
		const coreList = preWODCategory.core || [];
		const sets = preWODCategory.sets || 3;
		const repsList = preWODCategory.reps_range || [8, 10, 12];

		if (
			compoundList.length === 0 ||
			accessoryList.length === 0 ||
			coreList.length === 0
		) {
			console.warn(
				`⚠️ Attention : Données manquantes dans preWODCategory`,
				preWODCategory
			);
			return null;
		}

		return {
			compound: getRandomElement(compoundList),
			accessory: getRandomElement(accessoryList),
			core: getRandomElement(coreList),
			sets: sets,
			reps: getRandomElement(repsList),
		};
	}

	function getRandomExercise(category) {
		const exercise = getRandomElement(category.exercises);
		const reps =
			Math.floor(
				Math.random() * (category.max_reps - category.min_reps + 1)
			) + category.min_reps;
		return { exercise, reps };
	}

	async function generateRandomWod() {
		const wodData = await fetchWodData();
		if (!wodData) return;

		wodContainer.innerHTML = '';

		const dayTypes = ['lower', 'upper', 'olympic'];
		const workoutTypes = wodData.workout_types;

		dayTypes.forEach((selectedDay) => {
			const training = getRandomTraining(wodData.strength[selectedDay]);

			const preWODType = getRandomElement(Object.keys(wodData.preWOD));
			const preWODCategory = wodData.preWOD[preWODType][selectedDay];

			let preWOD = null;
			if (preWODCategory) {
				preWOD = getRandomPreWOD(preWODCategory);
			} else {
				console.warn(
					`⚠️ Pas de preWOD pour ${preWODType} - ${selectedDay}. Affichage sans pré-WOD.`
				);
			}

			const wodFormat = getRandomElement(wodData.formats);

			const compound = getRandomExercise(
				wodData.workouts[selectedDay].compound
			);
			const metabolic = getRandomExercise(
				wodData.workouts[selectedDay].metabolic
			);
			const abdominal = getRandomExercise(
				wodData.workouts[selectedDay].abdominal
			);

			const wodCard = document.createElement('div');
			wodCard.classList.add('wod-card', 'animate-fade-in');

			let trainingHTML = `
                <h2 class="wod-title">${selectedDay.toUpperCase()} DAY</h2>
                <h3 class="text-[#FFFC66] font-bold mt-3">💪 Entraînement</h3>
                <p><strong>Mouvement:</strong> ${training.movement}</p>
            `;

			workoutTypes.forEach((type) => {
				const trainingInfo = training.trainingTypes[type];
				trainingHTML += `
                    <h4 class="mt-2 text-[#ff9666] font-semibold">${type.toUpperCase()}</h4>
                    <p><strong>${trainingInfo.sets} sets x ${
					trainingInfo.reps
				} reps</strong></p>
                `;
			});

			if (preWOD) {
				trainingHTML += `
                    <h3 class="text-[#ffc966] font-bold mt-3">🔥 Pré-WOD (${preWODType})</h3>
                    <p><strong>Compound:</strong> ${preWOD.compound} - ${preWOD.sets} sets x ${preWOD.reps} reps</p>
                    <p><strong>Accessory:</strong> ${preWOD.accessory}</p>
                    <p><strong>Core:</strong> ${preWOD.core}</p>
                `;
			} else {
				trainingHTML += `<p class="text-red-400">⚠️ Pas de pré-WOD disponible pour cette séance.</p>`;
			}

			trainingHTML += `
                <h3 class="text-[#69ff66] font-bold mt-3">🏋️ WOD - ${wodFormat}</h3>
                <p><strong>Compound:</strong> ${compound.exercise} (${compound.reps} reps)</p>
                <p><strong>Metabolic:</strong> ${metabolic.exercise} (${metabolic.reps} reps)</p>
                <p><strong>Abdominal:</strong> ${abdominal.exercise} (${abdominal.reps} reps)</p>
            `;

			wodCard.innerHTML = trainingHTML;
			wodContainer.appendChild(wodCard);
		});
	}

	generateBtn.addEventListener('click', generateRandomWod);
});

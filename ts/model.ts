module model {
	export interface Meal {
		describingLines: string[]
	}

	export interface Day {
		meals: Meal[];
		name: string;
		date: string;
	}
}

export = model;
module model {
	export interface Meal {
		describingLines: string[]
	}

	export interface Day {
    	meals: Meal[];
    	name: string
	}    
}

export = model;
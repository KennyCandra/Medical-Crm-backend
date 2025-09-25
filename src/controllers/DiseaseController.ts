
import DiseaseModule from "../modules/DiseaseModule";

export default class DiseaseController {

    static async fetchSpecificDisease(value: string) {
        let searchValue = ""
        value ? searchValue = value : searchValue = ""
        const diseases = await DiseaseModule.searchDiseases(searchValue)
        return diseases
    }
}
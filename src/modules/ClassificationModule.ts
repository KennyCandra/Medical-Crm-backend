import { Classification } from "../entities/Classification"
import BasicModule from "./BasicModule";

export default class ClassificationModule extends BasicModule<Classification> {
    private static instance: ClassificationModule;
    protected entityClass = Classification;
    protected entityName = "Classification";

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ClassificationModule();
        }
        return this.instance;
    }
}
type diagnosis = {
    id: string,
    name: string
}
type allergy = {
    id: string,
    name: string
}

type prescriptions = {
    id: string;
    status: "done" | "taking";
    doctor: string;
    date: Date
}


type ModifiedPrescriptionsToResponse = {
    prescriptions: prescriptions[],
    done: any;
    notDone: any;
    total: number;
}

type updatedUser = {
    first_name: string;
    last_name: string;
    gender: "male" | "female";
    NID: string;
    birth_date: Date;
    role: "doctor" | "patient" | "admin" | "ed" | "researcher";
    blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "unknown";
}

export type CustomUser = {
    returnedUser: updatedUser,
    modifiedPrescriptionsToResponse: ModifiedPrescriptionsToResponse,
    filterDiseasesToOneDisease: diagnosis[],
    filterAllergiesToOneAllergy: allergy[]
}
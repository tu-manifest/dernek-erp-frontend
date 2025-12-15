// Settings Types

export interface AssociationSettings {
    name: string;
    owner: string;
    phone: string;
    email: string;
    address: string;
    taxNumber: string;
    foundedYear: string;
    website: string;
}

export interface ThemeSettings {
    mode: "light" | "dark" | "system";
    primaryColor: string;
    secondaryColor: string;
}

export interface AllSettings {
    association: AssociationSettings;
    theme: ThemeSettings;
}

export const DEFAULT_SETTINGS: AllSettings = {
    association: {
        name: "",
        owner: "",
        phone: "",
        email: "",
        address: "",
        taxNumber: "",
        foundedYear: "",
        website: "",
    },
    theme: {
        mode: "light",
        primaryColor: "#2563eb",
        secondaryColor: "#4f46e5",
    },
};

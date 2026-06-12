export interface Patient {
    id: string;
    nationalId: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber?: string;
    version: number;
    updatedAt: number;
}

export interface Sample {
    id: string;
    patientId: string;
    barcodeGs1: string;
    sampleType: string;
    status: string;
    collectedAt: number;
    version: number;
    updatedAt: number;
}

export interface TestResult {
    id: string;
    sampleId: string;
    testName: string;
    resultValue: string;
    referenceRange: string;
    unit: string;
    status: string;
    resultSha256Hash: string;
    verifiedAt: number;
    version: number;
    updatedAt: number;
}

export interface SampleLog {
    id: string;
    sampleId: string;
    status: string;
    statusLabelText: string;
    timestamp: number;
    assignedOperator: string;
}

export interface NotificationLog {
    id: string;
    sampleId: string;
    recipient: string;
    message: string;
    status: string;
    attempts: number;
    timestamp: number;
}

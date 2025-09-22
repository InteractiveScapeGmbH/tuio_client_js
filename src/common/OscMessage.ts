export interface OscMessage {
    address: string;
    args: (number | string | boolean | Blob | null)[];
}
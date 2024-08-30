import PocketBase from "pocketbase";
import { URL } from "src/config";

export const pb = new PocketBase(URL.SERVER);

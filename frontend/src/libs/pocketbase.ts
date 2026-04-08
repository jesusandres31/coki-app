import PocketBase from "pocketbase";
import { config } from "src/config";

export const pb = new PocketBase(config.PB.SERVER);

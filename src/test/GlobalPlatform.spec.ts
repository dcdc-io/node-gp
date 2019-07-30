import { expect } from "chai"
import "mocha"
import { readFileSync } from "fs";
import { loadAsync } from "jszip"
import GlobalPlatform from "../GlobalPlatform";

describe("GlobalPlatform", async () => {
    const gp = new GlobalPlatform(async (x) => x)
    it("should load a cap file", async () => {
        // gp
        const data = readFileSync("d:/javacard-ndef-full-plain.cap")
        const zdata = await loadAsync(data)
        const x = await gp.installForLoad(zdata)
        x // ?+
    })
})
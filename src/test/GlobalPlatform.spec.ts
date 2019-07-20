import { expect } from "chai"
import "mocha"
import GlobalPlatform from "../GlobalPlatform";
import { readFileSync } from "fs";
import { loadAsync } from "jszip"

describe("GlobalPlatform", async () => {
    const gp = new GlobalPlatform(null)
    it("should load a cap file", async () => {
        // gp
        const data = readFileSync("d:/javacard-ndef-full-plain.cap")
        const zdata = await loadAsync(data)
        const x = await gp.installForLoad(zdata)
        x // ?+
    })
})
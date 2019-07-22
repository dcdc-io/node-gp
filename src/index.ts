import { SW_OK, CHECK, SW } from "./Utils"
import { readFileSync } from "fs"
import { loadAsync as loadZip } from "jszip"
import GlobalPlatform from "./GlobalPlatform"

const smartcard = require('smartcard')
const Devices = smartcard.Devices
const devices = new Devices()

devices.on('device-activated', ({ device }:any) => {
    // device.setShareMode(2) // TODO: benbenbenbenbenben/smartcard
    device.on('card-inserted', ({card}:any) => setTimeout(async () => {

        device.on('card-removed', (rDevice:any) => {
            if (rDevice.card === card) {
                // this card was removed
            }
        })

        const gpcard = new GlobalPlatform(card)
        await gpcard.connect()
        
        const zdata = await loadZip(readFileSync("javacard-ndef-full-plain.cap"))
        const installauto = await gpcard.installAuto(zdata)

        CHECK(SW_OK(installauto), `unexpected response for INSTALL ${SW(installauto).toString(16)}`)
    }, 500 /* TODO: remove this delay hack for exclusive/shared access interference */))
}); 
import { CardCrypto } from "./CardCrypto"
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
                // this card removed
            }
        })

        let gpcard = new GlobalPlatform(card)
        await gpcard.connect()

        let packages = await gpcard.getPackages()
        let applets = await gpcard.getApplets()
        
        console.log(packages)
        console.log(applets)
        //console.log(appletsraw)

        // load cap file (e.g. ndef tag)
        // D:\javacard-ndef-full-plain.cap
        const data = readFileSync("d:/javacard-ndef-full-plain.cap")
        const zdata = await loadZip(data)
        zdata.forEach((path) => {
            console.log(path)
        })

        const loadresponse = await CardCrypto.installForLoad(card, zdata)
        CHECK(SW_OK(loadresponse), `unexpected response for INSTALL (for load) ${SW(loadresponse).toString(16)}`)

    }, 500 /* TODO: remove this delay hack for exclusive/shared access interference */))
}); 
import { randomBytes } from "crypto";
import { CardCrypto } from "./CardCrypto";
import IApplication from "./IApplication";
import { CHECK, SW_OK, SW } from "./Utils";


export default class GlobalPlatform implements IApplication {

    // TODO: fork smartcard and port to TS
    card:any = null

    DefaultAuthKey = "404142434445464748494a4b4c4d4e4f"
    secureChannelBaseKey = ""
    sMacKey = ""
    sEncKey = ""
    dekKey = ""

    private _connected = false

    /**
     *
     */
    constructor(card:any, keys?:{ secureChannelBaseKey?:string, sMacKey?:string, sEncKey:string, dekKey?:string }) {
        this.card = card
        if (keys) {
            Object.assign(this, keys)
        }
        this.secureChannelBaseKey = this.secureChannelBaseKey || this.DefaultAuthKey
        this.sMacKey = this.sMacKey || this.secureChannelBaseKey
        this.sEncKey = this.sEncKey || this.secureChannelBaseKey
        this.dekKey = this.dekKey || this.secureChannelBaseKey
    }

    /**
     * Connects to the present device and executes the INITIALIZE UPDATE command
     */
    async connect() {
        CHECK(!this._connected, "already connected and INITIALIZE state unrecoverable")

        // setup
        const hostChallenge = randomBytes(8).toString("hex")

        // 1. select gp
        const selectGpResponse = await this.card.issueCommand("00a4040000")
        CHECK(SW_OK(selectGpResponse), `unexpected ${SW(selectGpResponse).toString(16)}`)
        
        // 2. initialize update
        const initUpdateResponse = await this.card.issueCommand("8050000008" + hostChallenge + "28")
        CHECK(SW_OK(initUpdateResponse), `unexpected ${SW(selectGpResponse).toString(16)}`)
        CHECK(initUpdateResponse.length === 30, `init response length incorrect`)

        const sequence = initUpdateResponse.slice(12, 14).toString("hex")
        const sessionKeys = {
            cmac:   CardCrypto.tripleDesCbc(Buffer.from("0101" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sMacKey, "hex")),
            rmac:   CardCrypto.tripleDesCbc(Buffer.from("0102" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sMacKey, "hex")),
            dek:    CardCrypto.tripleDesCbc(Buffer.from("0181" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sEncKey, "hex")),
            enc:    CardCrypto.tripleDesCbc(Buffer.from("0182" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.dekKey, "hex"))
        }

        const cardChallenge = initUpdateResponse.slice(12, 20).toString("hex")
        const cardExpected = initUpdateResponse.slice(20, 28).toString("hex")
        const cardCalc = CardCrypto.tripleDesCbc(Buffer.from(hostChallenge + cardChallenge + "8000000000000000", "hex"), sessionKeys.enc).slice(16, 24).toString("hex")
        const hostCalc = CardCrypto.tripleDesCbc(Buffer.from(cardChallenge + hostChallenge + "8000000000000000", "hex"), sessionKeys.enc).slice(16, 24).toString("hex")
        CHECK(cardExpected === cardCalc, `card cryptogram failed`)

        let externalAuthenticate = "8482000010" + hostCalc
        const eaSignature = CardCrypto.getRetailMac(sessionKeys.cmac.toString("hex"), externalAuthenticate, "0000000000000000")
        externalAuthenticate += eaSignature.toString("hex")
        const externalAuthenticateResponse = await this.card.issueCommand(externalAuthenticate)
        CHECK(SW_OK(externalAuthenticateResponse), `unexpected auth response ${SW(externalAuthenticateResponse).toString(16)}`)
        
        this._connected = true
    }
    
    parseStatusResponse(response:Buffer) {
        let mode = 0
        let read = 0
        let output:any[] = []
        response.forEach((e: any) => {
            switch (mode) {
                case 0:
                    output.push({aid:[]})
                    read = e
                    mode = 1
                    break
                case 1:
                    output[output.length - 1].aid.push(e)    
                    read--
                    if (read === 0)
                        mode = 2
                    break
                case 2:
                    mode = 3
                    break
                case 3:
                    mode = 4
                    break
                case 4:
                    if (e === 144)
                        mode = 5
                    else {
                        output.push({aid:[]})
                        read = e
                        mode = 1
                    }
                    break
                case 5:
                    break                
            }  
        })
        return output
    }

    async getPackages() {
        CHECK(this._connected, "not connected")
        return this.parseStatusResponse(await this.card.issueCommand("80f22000024f00"))
    }

    async getApplets() {
        CHECK(this._connected, "not connected")
        return this.parseStatusResponse(await this.card.issueCommand("80f24000024f00"))
    }

    async deletePackage(status:{aid:Buffer | Uint8Array}) {
        const hexByte = (x:number) => Buffer.from([x]).toString("hex")
        this.card.issueCommand(`80e40080${hexByte(status.aid.length + 2)}4f${hexByte(status.aid.length)}${Buffer.from(status.aid).toString("hex")}00`)
    }
}
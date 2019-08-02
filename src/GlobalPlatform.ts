import { randomBytes } from "crypto"
import { CardCrypto } from "./CardCrypto"
import IApplication from "./IApplication"
import { CHECK, SW_OK, SW } from "./Utils"
import JSZip, { JSZipObject } from "jszip"
import { Stream } from "stream";

export default class GlobalPlatform implements IApplication {

    // TODO: fork smartcard and port to TS
    issueCommand!: (command:Buffer) => Promise<Buffer>
    readonly issueCommandStr = (command:string) => this.issueCommand(Buffer.from(command, "hex"))

    DefaultAuthKey = "404142434445464748494a4b4c4d4e4f"
    secureChannelBaseKey = ""
    sMacKey = ""
    sEncKey = ""
    dekKey = ""

    private _connected = false

    /**
     *
     */
    constructor(transceiveFunction:(command:Buffer) => Promise<Buffer>, keys?:{ secureChannelBaseKey?:string, sMacKey?:string, sEncKey:string, dekKey?:string }) {
        this.issueCommand = transceiveFunction
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
        const selectGpResponse = await this.issueCommandStr("00a4040000")
        CHECK(SW_OK(selectGpResponse), `unexpected ${SW(selectGpResponse).toString(16)}`)
        
        // 2. initialize update
        const initUpdateResponse = await this.issueCommandStr("8050000008" + hostChallenge + "28")
        CHECK(SW_OK(initUpdateResponse), `unexpected ${SW(selectGpResponse).toString(16)}`)
        CHECK(initUpdateResponse.length === 30, `init response length incorrect`)

        const sequence = initUpdateResponse.slice(12, 14).toString("hex")
        const sessionKeys = {
            cmac:   CardCrypto.tripleDesCbc(Buffer.from("0101" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sMacKey, "hex")).slice(0, 16),
            rmac:   CardCrypto.tripleDesCbc(Buffer.from("0102" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sMacKey, "hex")).slice(0, 16),
            dek:    CardCrypto.tripleDesCbc(Buffer.from("0181" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sEncKey, "hex")).slice(0, 16),
            enc:    CardCrypto.tripleDesCbc(Buffer.from("0182" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.dekKey, "hex")).slice(0, 16)
        }

        const cardChallenge = initUpdateResponse.slice(12, 20).toString("hex")
        const cardExpected = initUpdateResponse.slice(20, 28).toString("hex")
        const cardCalc = CardCrypto.tripleDesCbc(Buffer.from(hostChallenge + cardChallenge + "8000000000000000", "hex"), sessionKeys.enc).slice(16, 24).toString("hex")
        const hostCalc = CardCrypto.tripleDesCbc(Buffer.from(cardChallenge + hostChallenge + "8000000000000000", "hex"), sessionKeys.enc).slice(16, 24).toString("hex")
        CHECK(cardExpected === cardCalc, `card cryptogram failed`)

        let externalAuthenticate = "8482000010" + hostCalc
        const eaSignature = CardCrypto.getRetailMac(sessionKeys.cmac.toString("hex"), externalAuthenticate, "0000000000000000")
        externalAuthenticate += eaSignature.toString("hex")
        const externalAuthenticateResponse = await this.issueCommandStr(externalAuthenticate)
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
        const statusResponse = await this.issueCommandStr("80f22000024f00")
        if (SW(statusResponse) == 0x6a88) {
            return []
        }
        return this.parseStatusResponse(statusResponse)
    }

    async getApplets() {
        CHECK(this._connected, "not connected")
        const statusResponse = await this.issueCommandStr("80f24000024f00")
        if (SW(statusResponse) == 0x6a88) {
            return []
        }
        return this.parseStatusResponse(statusResponse)
    }

    async deletePackage(status:{aid:Buffer | Uint8Array}) {
        const hexByte = (x:number) => Buffer.from([x]).toString("hex")
        this.issueCommandStr(`80e40080${hexByte(status.aid.length + 2)}4f${hexByte(status.aid.length)}${Buffer.from(status.aid).toString("hex")}00`)
    }

    async unzipCap(zdata:JSZip):Promise<{module:string, data:Buffer, i:number}[]> {
        const moduleNames = ["Header", "Directory", "Import", "Applet", "Class", "Method", "StaticField", "Export", "ConstantPool", "RefLocation"]
        
        const modules = []
        for (let mod of moduleNames) {
            const files = zdata.filter(f => f.endsWith(`${mod}.cap`))
            if (files.length > 0) {
                modules.push({
                    module: mod,
                    data: await files[0].async("nodebuffer"),
                    i: modules.length
                })
            }
        }

        return modules
    }

    async installAuto(zdata:JSZip):Promise<Buffer> {
        const modules = await this.unzipCap(zdata)
        const capaid = modules.find((m) => m.module === "Header")!.data.slice(13, 13 + modules.find((m) => m.module === "Header")!.data[12])
        const appaid = modules.find((m) => m.module === "Applet")!.data.slice(5, 5 + modules.find((m) => m.module === "Applet")!.data[4])

        const lsw = await this.installForLoad(zdata)
        CHECK(SW_OK(lsw), `unexpected response ${SW(lsw).toString(16)}`)

        const isw = await this.installForInstall(capaid.toString("hex"), appaid.toString("hex"))
        CHECK(SW_OK(isw), `unexpected response ${SW(isw).toString(16)}`)

        return isw
    }

    async installForLoad(zdata:JSZip):Promise<Buffer> {
        const modules = await this.unzipCap(zdata)

        const aid = modules.find((m) => m.module === "Header")!.data.slice(13, 13 + modules.find((m:any) => m.module === "Header")!.data[12])

        let apdu:string[] = []

        // install
        apdu.push(`80e60200${(aid.length + 5 + 256).toString(16).substring(1)}${(aid.length + 256).toString(16).substring(1)}${aid.toString("hex")}0000000001`)

        // load loop
        // see https://www.w3.org/Protocols/HTTP-NG/asn1.html for ASN.1/TLV info
        let contig = Buffer.concat(modules.map(m => m.data))
        const block = 0xfa        
        if (contig.length < 128) {
            apdu.push(`80e80000c4${Buffer.from([contig.length]).toString("hex")}${contig.toString("hex")}`)
        }
        else {
            Buffer.from([apdu.length - 1, block]).toString("hex") // ?
            apdu.push(`80e800${Buffer.from([apdu.length - 1, Math.min(block, contig.length) + 4]).toString("hex")}c482${Buffer.from([contig.length >> 8, contig.length]).toString("hex")}${contig.slice(0, block).toString("hex")}`)
            contig = contig.slice(block)
        }
        while (contig.length) {
            apdu.push(`80e8${contig.length > block ? "00" : "80"}${Buffer.from([apdu.length - 1, Math.min(block, contig.length)]).toString("hex")}${contig.slice(0, block).toString("hex")}`)
            contig = contig.slice(block)
        }
        
        let sw = Buffer.from([0])
        for (let cmd of apdu) {
            sw = await this.issueCommandStr(cmd)
            CHECK(SW_OK(sw), `unexpected response ${SW(sw).toString(16)} for ${cmd}`)
        }
        return sw
    }

    async installForInstall(capaid:string, modaid:string):Promise<Buffer> {
        // see spec 2.1.1 9.5.2.3.1 for data
        /**
         * 1 len load file aid
         * 5-16
         * 1 module aid
         * 5-16
         * 1 app aid
         * 5-16
         * 1 len privs
         * 1 privs
         * 1 len params
         * 2-n params
         * 1 len token
         * 0-n token
         * 05 
         * D2 76 00 00 85
         * 07
         * D2 76 00 00 85 01 01
         * 07
         * D2 76 00 00 85 01 01
         * 01
         * 00 
         * 02 
         * C9 00 (TLV)
         * 00
         * 00
         *  */
        let instaid = modaid

        let data = ""
        data += `${Buffer.from([capaid.length / 2]).toString("hex")}${capaid}`
        data += `${Buffer.from([modaid.length / 2]).toString("hex")}${modaid}`
        data += `${Buffer.from([instaid.length / 2]).toString("hex")}${instaid}`
        data += "0100" // privs
        data += "02c900" // params
        data += "00" // token

        const apdu = `80e60c00${Buffer.from([data.length / 2]).toString("hex")}${data}00`

        const sw = await this.issueCommandStr(apdu)
        CHECK(SW_OK(sw), `unexpected response ${SW(sw).toString(16)} for ${apdu}`)

        return sw
    }
}

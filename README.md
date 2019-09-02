# node-gp

A get the job done javascript/typescript library for interacting with GlobalPlatform devices. You can use node-gp to manage a GlobalPlatform device on any major desktop OS and Android.

node-gp provides a GlobalPlatform class that requires a single function in order to communicate with a device. You must provide an interface for the device itself; in node.js [smartcard](https://www.npmjs.com/package/smartcard) does this job well and for mobile apps [phonegap-nfc](https://github.com/chariotsolutions/phonegap-nfc) is just as good.

## Quick Start:

#### Using node-gp with smartcard in node.js/electron/nw.js projects:

> note: linux users beware - when using [tomkp/smartcard](https://github.com/tomkp/smartcard) you are advised to review the steps required for [santigimeno/node-pcsclite](https://github.com/santigimeno/node-pcsclite) as this lilbrary is ultimately doing the communication with your hardware. We're looking into simplifying this.

First add node-gp and smartcard to your project:

`npm install node-gp smartcard --save`

Then you want a function to integrate your hardware library (smartcard in this case) and node-gp.

Because smartcard already has a promisified `issueCommand` function that takes a string or Buffer as a parameter, integration is as easy as *snippet 1.*.

*snippet 1.*
```javascript
const transceive = event.card.issueCommand.bind(event.card)
const gpcard = new GlobalPlatform(transceive)
```

If you want the fully working example `index.js` then copy this *index.js example*:

```javascript
// index.js
const GlobalPlatform = require("node-gp")
const smartcard = require('smartcard')

const Devices = smartcard.Devices
const devices = new Devices()

devices.on('device-activated', event => {
    event.device.on('card-inserted', event => {
        const transceive = event.card.issueCommand.bind(event.card)
        const gpcard = new GlobalPlatform(transceive)
        gpcard.connect().then(() => {
            console.log("connected")
            // now you have a connected device
            gpcard.getPackages().then(packages => {
                for (let package of packages) {
                    // demo: print out package aids
                    console.log(Buffer.from(package.aid).toString("hex"))
                }
            })
        }).catch(error => {
            console.error(error)
        })
    })
})
```

#### Using node-gp with phonegap-nfc in phonegap/cordova/etc mobile projects:

There is a complete example for node-gp with Cordova here: [https://github.com/dcdc-io/node-gp-phonegap](https://github.com/dcdc-io/node-gp-phonegap)

More coming soon....

## Background 

node-gp was created to make smartcard development accessible to more people and more platforms. 

Smartcard development is hard and the existing tools will leave you wondering why you ever bothered*. Given that there are overwhelmingly more smartcards in the world than there are smartphones - **your passport, debit card, and sim card are smartcards** - we figured we should make programming this type of device feel less like stepping in dogshit with new shoes on the way to a job interview you're already late to, and instead more like typing "npm install" and hitting return.

_*There are notable exceptions to this trend like the fantastic [GlobalPlatformPro](https://github.com/martinpaljak/GlobalPlatformPro) from [Martin Paljak](https://github.com/martinpaljak). If you're doing a lot of smartcard work you'll want to GlobalPlatformPro in your toolkit._

The rising interest in decentralised apps, blockchains, distributed ledgers, IoT, and so on, has driven the need for small, low power, low cost and normal person usable cryptography. Smartcard devices like the tiny chip in your bank card give you portable cryptographic computation and very secure key storage without both the [bullshit of charging batteries](https://www.macworld.co.uk/how-to/apple/improve-apple-watch-battery-life-3609928/) and the [inexplicable paying for 1U of LEDs and aluminium](https://medium.com/@simonvc/hsms-are-bullshit-imho-f9f736e1e5f2). We think these smartcard devices are so important that to not have made an easy-to-use programmer would have been criminal on our part.

### Global Platform

We're using the 2.1.1 specification as a reference for this implementation, and we're not anticipating that we will cover it to a large extent. We're interested in basic installing and deleting applets as far as Global Platform goes. Anything else we need will be added case by case when it's worth anybody's time to do it.

You can get more information about the specification at the [official site](https://globalplatform.org/specs-library/).

## Android and iPhone Support

node-gp itself doesn't have any hardware requirements. Instead it asks that you implement an `transceive` function to send and receive APDUs. This means that if your platform supports [phonegap-nfc](https://github.com/chariotsolutions/phonegap-nfc) or [smartcard with pcsc-lite](https://www.npmjs.com/package/smartcard) then node-gp will work. Android devices with NFC support and other computers with smartcard readers are almost always going to work.

At the time of writing node-gp is not useful for iOS devices because Apple disables meaningful use of the NFC API. If you are an iPhone/iPad etc user and you want to use NFC then you will need either get a proper phone and/or [lobby and Apple and let them know you want NFC enabling.](https://www.apple.com/feedback/iphone.html)

## Building

node-gp is a typescript project and we're using yarn as a package manager (which means we don't test `npm` but it likely works the same).

To build:

`yarn rebuild`

Or npm if you really insist:

`npm rebuild`

## Usage

Whether you load the `browser/nodegp-bundle.js` in a script tag or `require('node-gp')` in your node project you are likely going to work with the `GlobalPlatform` class as your base class and not bother with anything else.

To use the `GlobalPlatform` class directly do something like the following:

_mobile snippet (untested**)._
```javascript
// mobile example with phonegap-nfc (after a <script src="browser/nodegp-bundle.js">)
const transceiveFunction = nfc.transceive.bind(nfc)
const gpcard = new GlobalPlatform(transceiveFunction)
const okay = await gpcard.connect()
// do stuff
```

_node snippet._
```javascript
// desktop example with smartcard + pcsc-lite (after a GlobalPlatform = require("node-gp"))
reader.on('connected', ({card}) => {
    const transceiveFunction = card.issueCommand.bind(card)
    const gpcard = new GlobalPlatform(transceiveFunction)
    const okay = await gpcard.connect()
    // do stuff
})
```

### More on the `transceive` function:

The `transceive` function is best understood by it's TypeScript signature:

```typescript
transceiveFunction = async (command: Buffer) => Buffer
```

The `async`-ness of the function is technically optional. Provided the function you pass as a first parameter to the `new GlobalPlatform(transceiveFunction)` will both accept a Buffer and return/resolve to a Buffer then everything will work.

### How to use the `Buffer` class in none node.js environments:

In the browser node-gp uses a bundled instance of [feross/buffer](https://github.com/feross/buffer) to polyfill for node.js' Buffer class - so you won't need to bring anything in.

Using `string`s tends to be easier when you're hand rolling APDUs so if you need to convert a `string` to a `Buffer` you should use:

`const buffer = Buffer.from(str, "hex")`

And if vice-versa you want to convert a `Buffer` to a `string`:

`const str = Buffer.toString("hex")`

_**note: a `transceiveFunction` for browser may need to convert data because the Buffer API isn't necessarily compatible with your chosen hardware integration library._ 

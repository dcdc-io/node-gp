# node-gp

A get the job done node.js library for interacting with GlobalPlatform devices. You can use node-gp to manage a GlobalPlatform device on any major desktop OS and Android without complicated external dependencies.

## Background 

node-gp was created to make smartcard development accessible to more people and more platforms. 

Smartcard development is hard and the existing tools will leave you wondering why you ever bothered*. Given that there are overwhelmingly more smartcards in the world than there are smartphones - **your passport, debit card, and sim card are smartcards** - we figured we should make programming this type of device feel less like stepping in dogshit with new shoes on the way to a job interview you're already late to, and instead more like typing "npm install" and hitting return.

_*There are notable exceptions to this trend like the fantastic [GlobalPlatformPro](https://github.com/martinpaljak/GlobalPlatformPro) from [Martin Paljak](https://github.com/martinpaljak). If you're doing a lot of smartcard work you'll want to GlobalPlatformPro in your toolkit._

The rising interest in decentralised apps, blockchains, distributed ledgers, IoT, and so on, has driven the need for small, low power, low cost and normal person usable cryptography. Smartcard devices like the tiny chip in your bank card give you portable cryptographic computation and very secure key storage without both the [bullshit of charging batteries](https://www.macworld.co.uk/how-to/apple/improve-apple-watch-battery-life-3609928/) and the [inexplicable paying for 1U of LEDs and aluminium](https://medium.com/@simonvc/hsms-are-bullshit-imho-f9f736e1e5f2). We think these smartcard devices are so important that to not have made an easy-to-use programmer would have been criminal on our part.

### Global Platform

We're using the 2.1.1 specification as a reference for this implementation, and we're not anticipating that we will cover it to a large extent. We're interested in basic installing and deleting applets as far as Global Platform goes. Anything else we need will be added case by case when it's worth anybody's time to do it.

You can get more information about the specification at the [official site](https://globalplatform.org/specs-library/).

## Android and iPhone Support

node-gp itself doesn't have any hardware requirements. Instead it asks that you implement an `issueCommand` function to send and receive APDUs. This means that if your platform supports [phonegap-nfc](https://github.com/chariotsolutions/phonegap-nfc) or [smartcard with pcsc-lite](https://www.npmjs.com/package/smartcard) then node-gp will work. Android devices with NFC support and other computers with smartcard readers are almost always going to work.

At the time of writing node-gp is not useful for iOS devices because Apple disables meaningful use of the NFC API. If you are an iPhone/iPad etc user and you want to use NFC then you will need either get a proper phone and/or [lobby and Apple and let them know you want NFC enabling.](https://www.apple.com/feedback/iphone.html)

## Building

node-gp is a typescript project and we're using yarn as a package manager.

To build:

`yarn rebuild`

We don't, but you can use npm if you really insist:

`npm rebuild`

## Usage

Whether you load the `browser/bundle.js` in a script tag or `require('node-gp')` in your node project you are likely going to work with the `GlobalPlatform` class as your base class and not bother with anything else.

To use the `GlobalPlatform` class directly do something like the following:

```javascript
// mobile example with phonegap-nfc (after a <script src="browser/bundle.js">)
const handler = {
    issueCommand: nfc.transceive.bind(nfc)
}
const gpcard = new GlobalPlatform(handler)
const okay = await gpcard.connect()
// do stuff
```

```javascript
// desktop example with smartcard + pcsc-lite (after a GlobalPlatform = require("node-gp"))
reader.on('connected', ({card}) => {
    const gpcard = new GlobalPlatform(card)
    const okay = await gpcard.connect()
    // do stuff
})
```


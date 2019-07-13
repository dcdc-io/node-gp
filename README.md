# node-gp
A get the job done node.js library for interacting with GlobalPlatform devices.

## Background 

node-gp was created to make smartcard development accessible to more people and more platforms.

Smartcard development is hard and the existing tools will leave you wondering why you ever bothered*. Given that there are overwhelmingly more smartcards in the world than there are smartphones - **your passport, debit card, and sim card are smartcards** - we figured we should make programming this type of device feel less like stepping in dogshit with new shoes on the way to a job interview you're already late to, and instead more like typing "npm install" and hitting return.

_*There are notable exceptions to this trend like the fantastic [GlobalPlatformPro](https://github.com/martinpaljak/GlobalPlatformPro) from [Martin Paljak](https://github.com/martinpaljak). If you're looking for a smartcard expert for you project, we say hit him up!_

The rise of interest in decentralised apps, blockchains, distributed ledgers, IoT, and so on, has driven the need for small, low power, low cost and normal person usable cryptography. Smartcard devices like the tiny chip in your bank card give you portable cryptographic computation and very secure key storage without both the [bullshit of charging batteries](https://www.macworld.co.uk/how-to/apple/improve-apple-watch-battery-life-3609928/) and the [inexplicable paying for 1U of LEDs and aluminium](https://medium.com/@simonvc/hsms-are-bullshit-imho-f9f736e1e5f2). We think these msartcard devices are so important that to not have made an easy-to-use programmer would have been criminal on our part.


## Building

node-gp is a typescript project and we're using yarn as a package manager. If you would prefer just javascript and npm then we'll defend our decision not to for €80+ p/h.

To install dependencies and build run:

`yarn rebuild`
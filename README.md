# Shadowdark RPG Homebrew Module Template
A Foundry VTT homebrew module template for use with Shadowdark RPG

## How to Install
Download the latest template [here](https://github.com/PrototypeESBU/foundryvtt-shadowdark-custom-module/releases/latest/download/shadowdark-homebrew.zip)
### Installing on local Foundry server
1. Unzip file to Data\modules\ inside your Foundry VTT user data folder. Directory path should look like this: "Data\modules\shadowdark-homebrew"
2. Restart the Foundry VTT server

### Installing on Forge hosted Foundry server
1. Go to the Games Configuration, click “Summon Import Wizard” in the “Table Tools” section. 
2. Turn off the “Install found packages from the Bazaar” toggle.
3. Choose ZIP file and browse for the module.zip file. 
4. Click Analyze

## Macro Scripts
- [Homebrew Compendium Import](scripts/homebrew_import.js)

## Monster Artwork Remapping
An optional version of the shadowdark-homebrew modules is available [here](https://github.com/PrototypeESBU/foundryvtt-shadowdark-custom-module/releases/latest/download/shadowdark-homebrew.with.monster.remap.zip).
This version will remap all the monster artwork in the default monster compendium to .webp files you provide in the appropriate module directories.

Place portrait artwork file in `shadowdark-homebrew/artwork/portraits`

Place token artwork file in `shadowdark-homebrew/artwork/tokens`

- Files must be .webp 
- Use the monster name in all lower case with adjectives at the end
- Drop commas and replace spaces with - 

```
e.g.
aboleth.webp
centipede-giant.webp
bear-brown.webp
dung-beetle-giant.webp
elemental-air-greater.webp
will-o'-wisp.webp
```

Note: You can disable this mapping for portraits and/or tokens under **Configure Art** in the shadowdark system settings

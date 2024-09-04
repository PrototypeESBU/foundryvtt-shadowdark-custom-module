// ==================================
// Homebrew Compendium Import Macro
// ==================================
// Author: Prototype
// Version: 1.1
// Description: Copies all compendium items of source type to the homebrew compendium.
//===================================
const destinationCompendium = "shadowdark-homebrew.items";
const targetTag = "shadowdark_homebrew";
///==================================

//contruct prompt HTML
const selectOptions = await getSelectOptions();
const content = `
<form class="shadowdark" autocomplete="off" spellcheck="off">
    <div class="SD-banner">Homebrew Import</div>
    <div class="form-group">
        <h3>Select Source Tag</h3>
        <select name="source_tag">
            ${selectOptions}
        </select>
    </div>
    <hr />
</form>
`;

//open prompt
const dialogData = {
    title: "Homebrew Import",
    content,
    buttons: {
        import: {
            label: "Import",
            callback: async html => {
                // get input from HTML
                let sourceTag = html.find("[name=source_tag]")?.val();
                // load the items
                const loadingDialog = new shadowdark.apps.LoadingSD().render(true);
                await importItems(sourceTag);
                loadingDialog.close({force: true});
            },
        },
    },
}

//display dialog
await Dialog.wait(dialogData);

//====================================================================

async function getSelectOptions() {
    let options = "<option value="-"></option>";
    const sources = await shadowdark.compendiums.sources();
    for (source of sources) {
        if (source.uuid !== targetTag) {
            options += `<option value="${source.uuid}">${source.name}</option>`;
        }
    }
    return options;
}

async function importItems(sourceTag) {
    let dest = game.packs.get(destinationCompendium);
    let mapping = {};
    let itemsImported = [];

    //get all compendiums
    for (pack of game.packs) {
        if (pack.metadata.id === destinationCompendium) continue;
        if (pack.metadata.type !== "Item") continue;

        // get all items in pack
        let source = await game.packs.get(pack.metadata.id);
        for (const item of source.index) {
            let sourceItem = await fromUuid(item.uuid);

            // 
            if (sourceItem.system.source.title !== sourceTag) continue;

            //if it's an existing item
            let existingItem = dest.index.find(x => 
                x.name === sourceItem.name
                && x.type === sourceItem.type
            );
            if (!existingItem) {

                //create folders
                let baseFolderID = await createFolders(sourceItem.folder, source, dest);

                //import item to homebrew compendium
                let newItem = await dest.importDocument(sourceItem);

                //update new item
                let updateObj = {
                    system: {
                        source: {
                            title: targetTag,
                        },
                    },
                };

                if (newItem.folder === null) {
                    updateObj = foundry.utils.mergeObject({folder: baseFolderID}, updateObj); 
                }

                await newItem.update(updateObj);

                //record changes
                itemsImported.push(newItem);
                mapping[sourceItem.uuid] = newItem.uuid;
            
            }
        }
    }

    // update items in homebrew with new paths
    for(const compendiumItem of game.packs.get(destinationCompendium).index) {
        let item = await fromUuid(compendiumItem.uuid);
        if (item.type === "Spell") {
            await item.update({"system.class": remap(item.system.class, mapping)});
        }
        if (item.type === "Ancestry") {
            await item.update({
                "system.talents": remap(item.system.talents, mapping),
                "system.languages.fixed": remap(item.system.languages.fixed, mapping),
                "system.languages.selectOptions": remap(item.system.languages.selectOptions, mapping)
            });
        }
        if (item.type === "Class") {
            await item.update({
                "system.armor": remap(item.system.armor, mapping),
                "system.weapons": remap(item.system.weapons, mapping),
                "system.talents": remap(item.system.talents, mapping),
                "system.talentChoices": remap(item.system.talentChoices, mapping),
                "system.languages.fixed": remap(item.system.languages.fixed, mapping),
                "system.languages.selectOptions": remap(item.system.languages.selectOptions, mapping)
            });
        }
        if (item.type === "Armor" || item.type === "weapon") {
            await item.update({
                "system.properties": remap(item.system.properties, mapping)
            });
        }
    }

    ui.notifications.info(`${itemsImported.length} items imported`);
}

function remap(property, mapping) {
    switch(typeof(property)) {
        case "string": return (mapping[property]) ? mapping[property]: property;
        case "object": return property.map(x => (mapping[x]) ? mapping[x]: x);
        default: return property;
    } 
}

async function createFolders(folder, srcPack, dstPack) {

    if(folder === null) {
        let foundFolder = dstPack.folders.find(x => 
            x.name === srcPack.metadata.label
            && x.depth === 1
        );
        if (foundFolder) {
            return foundFolder.id;
        }
        else {
            let baseFolder = await Folder.create({ name: srcPack.metadata.label, type: "Item"}, { pack: dstPack.collection });
            return baseFolder.id;
        }
    } else {
    
        let srcFolder = await srcPack.folders.get(folder.id);
        let parentId = await createFolders(srcFolder.folder, srcPack, dstPack);
        await dstPack.importFolder(srcFolder);
        if (srcFolder.folder === null) {
            let newFolder = await dstPack.folders.get(srcFolder.id);
            await newFolder.update({folder: parentId});
        }
        return parentId;
    }
}

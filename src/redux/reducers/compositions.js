import actionTypes from '../actions/actionTypes'
import ExportModes from '../../helpers/ExportModes'
import LottieVersions, {findLottieVersion} from '../../helpers/LottieVersions'
import LottieLibraryOrigins from '../../helpers/LottieLibraryOrigins'
import audioBitOptions from '../../helpers/enums/audioBitOptions'
import Variables from '../../helpers/styles/variables'
import random from '../../helpers/randomGenerator'
import {getSimpleSeparator} from '../../helpers/osHelper'
import deepmerge from 'deepmerge'
import { v4 as uuidv4 } from 'uuid';

let initialState = {
	list: [],
  filter: '',
  items:{},
  current: 0,
  show_only_selected: false,
  shouldUseCompNameAsDefault: false,
  shouldUseAEPathAsDestinationFolder: false,
  shouldUsePathAsDefaultFolder: false,
  shouldIncludeCompNameAsFolder: false,
  defaultFolderPath: '',
  shouldKeepCopyOfSettings: false,
  settingsDestinationCopy: null,
  shouldSaveInProjectFile: false,
  shouldSkipDoneView: false,
  shouldReuseFontData: false,
  templates: {
    active: true,
    list: [
    ]
  }
}
let extensionReplacer = /\.\w*$/g

let defaultComposition = {
    id: 0,
    name: '',
    destination: '',
    absoluteURI: '',
    selected: false,
    renderStatus: 0,
    settings: {
        segmented: false,
        segmentedTime: 10,
        standalone: false,
        avd: false,
        glyphs: true,
        includeExtraChars: false,
        bundleFonts: false,
        inlineFonts: false,
        hiddens: false,
        original_assets: false,
        original_names: false,
        should_encode_images: false,
        should_compress: true,
        should_skip_images: false,
        should_reuse_images: false,
        should_include_av_assets: false,
        compression_rate: 80,
        extraComps: {
            active: false,
            list:[]
        },
        guideds: false,
        ignore_expression_properties: false,
        export_old_format: false,
        use_source_names: false,
        shouldTrimData: false,
        skip_default_properties: false,
        not_supported_properties: false,
        pretty_print: false,
        useCompNamesAsIds: false,
        export_mode: ExportModes.STANDARD,
        export_modes: {
          standard: true,
          demo: false,
          standalone: false,
          banner: false,
          avd: false,
          smil: false,
          rive: false,
          reports: false,
        },
        demoData: {
          backgroundColor: Variables.colors.white,
        },
        banner: {
          lottie_origin: LottieLibraryOrigins.LOCAL,
          lottie_path: 'https://',
          lottie_library: LottieVersions[0].value,
          lottie_renderer: 'svg',
          width: 500,
          height: 500,
          use_original_sizes: true,
          original_width: 500,
          original_height: 500,
          click_tag: 'https://',
          zip_files: true,
          shouldIncludeAnimationDataInTemplate: false,
          shouldLoop: false,
          loopCount: 0,
          localPath: null,
        },
        expressions: {
          shouldBake: false,
          shouldCacheExport: false,
          shouldBakeBeyondWorkArea: false,
          sampleSize: 1,
        },
        audio: {
          isEnabled: true,
          shouldRaterizeWaveform: true,
          bitrate: audioBitOptions[0].value,
        },
        metadata: {
          includeFileName: false,
          customProps: [],
        },
        template: {
          active: false,
          id: 0,
          errors: [],
        },
        essentialProperties: {
          active: true,
          useSlots: false,
          skipExternalComp: false,
        }
    }
  }

function updateFilter(state, action) {
	let newState = {...state}
	newState.filter = action.value
	return newState
}

function toggleComposition(state, action) {
  let newState = {...state}
  let newItems = {...state.items}
  let newItem = {...state.items[action.id]}
  newItem.selected = !newItem.selected
  newItems[action.id] = newItem
  newState.items = newItems
  return newState
}

function createComp(comp) {
  return {
    ...defaultComposition, 
    id: comp.id, 
    uid: uuidv4(), 
    name: comp.name, 
    settings: {
      ...defaultComposition.settings,
      banner: {
        ...defaultComposition.settings.banner,
        width: comp.width || 500,
        height: comp.height || 500,
        original_width: comp.width || 500,
        original_height: comp.height || 500,
      },
      demoData: {
        ...defaultComposition.settings.demoData,
      }
    }
  }
}

const overwriteMerge = (_, destinationArray) => destinationArray

function setStoredData(state, action) {
  let compositions = action.projectData.compositions
  var item
  for(var comp in compositions) {
    if(compositions.hasOwnProperty(comp)){
      item = compositions[comp]
      if (!item.uid) {
        item.uid = uuidv4();
      }
      compositions[comp] = deepmerge(defaultComposition, item, { arrayMerge: overwriteMerge })
    }
  }
  console.log('compositions', compositions);
  let newState = {...state}
  newState.items = {
    ...newState.items,
    ...compositions,
  }
  if (action.projectData.extraState) {
    newState = {
      ...newState,
      ...action.projectData.extraState,
    }
  }
  return newState
}

/*function addCompositions(state, action) {
  let newItems = {...state.items}
  let listChanged: false
  let itemsChanged = false
  let newList = []
  action.compositions.forEach(function(item, index){
    if(!newItems[item.id]) {
      newItems[item.id] = createComp(item)
      itemsChanged = true
    } else if(newItems[item.id].name !== item.name) {
      newItems[item.id] = {...state.items[item.id], ...{name: item.name}}
      //newItems[item.id].name = item.name
      itemsChanged = true
    }
    newList.push(item.id)
    if(state.list[index] !== item.id) {
      listChanged = true
    }
  })
  if(!listChanged && state.list.length !== newList.length) {
    listChanged = true
  }
  if(!itemsChanged && !listChanged) {
    return state
  }
  let newState = {...state}
  if(listChanged) {
    newState.list = newList
  }
  if(itemsChanged) {
    newState.items = newItems
  }
  return newState
}*/

function searchRemovedExtraComps(settings, compositions) {
  let extraCompsList = settings.extraComps.list
  let newExtraCompsList = []
  let i, len = extraCompsList.length, item
  let j, jLen = compositions.length
  for(i=0;i<len;i++) {
    item = extraCompsList[i]
    j = 0
    while(j < jLen) {
      if(compositions[j].id === item) {
        newExtraCompsList.push(item)
        break
      }
      j += 1
    }
  }
  if(newExtraCompsList.length === extraCompsList.length){
    return settings
  }
  let newSettings = {...settings}
  newSettings.extraComps = {...settings.extraComps, ...{list:newExtraCompsList}}
  return newSettings
}

function updateCompsSize(settings, composition) {
  if(settings.banner.original_width !== composition.width
    || settings.banner.original_height !== composition.height) {
    return {
      ...settings,
        banner: {
          ...settings.banner,
          original_width: composition.width,
          original_height: composition.height,
        }
    }
  }
  return settings
}

function addCompositions(state, action) {
  const currentItems = state.items;
  let newItems = {}
  let listChanged = false
  let itemsChanged = false
  let newList = []
  let i, len = action.compositions.length
  let item, index
  for(i = 0; i < len; i += 1) {
    item = action.compositions[i]
    index = i
    if(!currentItems[item.id]) {
      newItems[item.id] = createComp(item)
      itemsChanged = true
    } else{
      let itemData = currentItems[item.id]
      if(currentItems[item.id].name !== item.name) {
        itemData = {...currentItems[item.id], ...{name: item.name}}
        //newItems[item.id].name = item.name
        itemsChanged = true
      }
      let settings = searchRemovedExtraComps(itemData.settings, action.compositions)
      settings = updateCompsSize(itemData.settings, item)
      if(settings !== itemData.settings){
        itemData = {...currentItems[item.id], ...{settings: settings}}
        itemsChanged = true
      }
      newItems[item.id] = itemData;
    } 
    newList.push(item.id)
    if(state.list[index] !== item.id) {
      listChanged = true
    }
  }
  if(!listChanged && state.list.length !== newList.length) {
    listChanged = true
  }
  if(!itemsChanged && !listChanged) {
    return state
  }

  let newState = {...state}
  if(listChanged) {
    newState.list = newList
  }
  if(itemsChanged) {
    newState.items = newItems
  }
  return newState
}


function setCompositionDestination(state, action) {
  let newItems = {...state.items}
  let newItem = {...state.items[action.compositionData.id]}
  newItem.absoluteURI = action.compositionData.absoluteURI
  newItem.destination = action.compositionData.destination
  newItems[action.compositionData.id] = newItem
  let newState = {...state}
  newState.items = newItems
  return newState
}

function startRender(state, action) {
  let newState = {...state}
  let newItems = {...state.items}
  let itemsChanged = false
  state.list.forEach(function(id, index){
    let item = state.items[id]
    if (item.renderStatus !== 0) {
      let newItem = {...item, ...{renderStatus: 0}}
      newItems[id] = newItem
      itemsChanged = true
    }
  })
  if(itemsChanged) {
    newState.items = newItems
    return newState
  }
  return state
}


/*function startRender(state, action) {
  let newState = {...state}
  let newItems = {...state.items}
  let itemsChanged = false
  let i, len = state.list.length
  let id
  for(i = 0; i < len; i += 1) {
    id = state.list[i]
    let item = state.items[id]
    if (item.renderStatus !== 0) {
      let newItem = {...item, ...{renderStatus: 0}}
      newItems[id] = newItem
      itemsChanged = true
    }
  }
  if(itemsChanged) {
    newState.items = newItems
    return newState
  }
  return state
}*/

function completeRender(state, action) {
  let newState = {...state}
  let newItems = {...state.items}
  let item = state.items[action.id]
  let newItem = {...item, ...{renderStatus: 1}}
  newItems[action.id] = newItem
  newState.items = newItems
  return newState
}

function setCurrentComp(state, action) {
  if(state.current === action.id) {
    return state
  }
  let newState = {...state}
  newState.current = action.id
  return newState
}

function cancelSettings(state, action) {
  if (state.items[state.current].settings === action.storedSettings) {
    return state
  }
  let newState = {...state}
  let newItems = {...state.items}
  let newItem = {...state.items[state.current]}
  newItem.settings = action.storedSettings
  if (newItem.settings.export_mode === ExportModes.STANDALONE){
    newItem.destination = newItem.destination.replace(extensionReplacer,'.js')
    newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.js')
  } else if (newItem.settings.export_mode === ExportModes.STANDARD){
    newItem.destination = newItem.destination.replace(extensionReplacer,'.json')
    newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.json')
  } else {
    if (newItem.settings.banner.zip_files) {
      newItem.destination = newItem.destination.replace(extensionReplacer,'.zip')
      newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.zip')
    } else {
      newItem.destination = newItem.destination.replace(extensionReplacer,'.json')
      newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.json')
    }
  }
  newItems[state.current] = newItem
  newState.items = newItems
  return newState
}

function toggleCustomProps(props, nameArray) {
  return props.map(prop => {
    if(prop.id === nameArray[0]) {
      return {
        ...prop,
        active: !prop.active,
      }
    }
    return prop
  })
}

function toggleSettingsValue(state, action) {
  let newItem = {...state.items[state.current]}
  let newSettings = {...newItem.settings}
  if (action.name === 'extraComps') {

    let newExtraComps = {...newSettings.extraComps}
    newExtraComps.active = !newExtraComps.active
    newSettings.extraComps = newExtraComps
  } else {
    var nameArray = action.name.split(':');
    var object = newSettings;
    while (nameArray.length) {
      var name = nameArray.shift();
      if (name === '[CUSTOM_PROP]') {
        object.customProps = toggleCustomProps(object.customProps, nameArray)
        break;
      }
      if (nameArray.length) {
        object[name] = {
          ...object[name],
        };
        object = object[name];
      } else {
        object[name] = !object[name];
      }
    }
  } 
  newItem.settings = newSettings
  let newItems = {...state.items}
  newItems[state.current] = newItem
  let newState = {...state}
  newState.items = newItems
  return newState

}

function toggleExtraComp(state, action) {
  let newItem = {...state.items[state.current]}
  let newSettings = {...newItem.settings}
  let newExtraComps = {...newSettings.extraComps}
  let list = newExtraComps.list
  let newList
  if (list.indexOf(action.id) === -1) {
    newList = [...list,action.id]
  } else {
    let index = list.indexOf(action.id)
    newList =  [ ...list.slice(0, index), ...list.slice(index + 1) ]
  }
  newExtraComps.list = newList
  newSettings.extraComps = newExtraComps
  newItem.settings = newSettings
  let newItems = {...state.items}
  newItems[state.current] = newItem
  let newState = {...state}
  newState.items = newItems
  return newState

}

function updateSettingsValue(state, action) {
  let newItem = {...state.items[state.current]}
  let newSettings = {...newItem.settings}
  var nameArray = action.name.split(':');
  var object = newSettings;
  while (nameArray.length) {
    var name = nameArray.shift();
    if (nameArray.length) {
      object[name] = {
        ...object[name],
      };
      object = object[name];
    } else {
      object[name] = action.value;
    }
  }

  newItem.settings = newSettings
  let newItems = {...state.items}
  newItems[state.current] = newItem
  let newState = {...state}
  newState.items = newItems
  return newState

}

function toggleSelected(state, action) {
  let newState = {...state}
  newState.show_only_selected = !newState.show_only_selected
  return newState
}

function applySettingsToAllComps(state, action) {
  const items = state.items
  const itemKeys = Object.keys(items)
  const newItems = itemKeys.reduce((accumulator, key) => {
    // checking for the id field to identify old versions of this data stored in local storage
    const settings = action.comp.id ? action.comp.settings : action.comp
    const comp = action.comp.id ? action.comp : {}
    const settingsClone = JSON.parse(JSON.stringify(settings))
    const item = items[key]
    if (item.selected) {
      const itemSettings = {
        ...item.settings,
        ...settingsClone
      }
      accumulator[key] = {
        ...item,
        destination: setFilePath(state, item.destination, comp.destination, item.name, getSimpleSeparator()),
        absoluteURI: setFilePath(state, item.absoluteURI, comp.absoluteURI, item.name, '/'),
         settings: itemSettings
      }
    } else {
      accumulator[key] = item
    }
    return accumulator
  }, {})
  return {
    ...state,
    items: newItems
  }
}

function setFilePath(state, originalPath, suggestedPath, name, separator) {
  if (originalPath) {
    return originalPath;
  }
  if (!state.shouldUseCompNameAsDefault) {
    return suggestedPath;
  }
  if(!suggestedPath) {
    return '';
  }
  const lastFolderIndex = suggestedPath.lastIndexOf(separator)
  return suggestedPath.substr(0, lastFolderIndex) + separator + name + '.json'
}

function applySettingsFromCache(state, action) {

  if(action.allComps) {
    return applySettingsToAllComps(state, action)
  }

  // checking for the id field to identify old versions of this data stored in local storage
  const settings = action.comp.id ? action.comp.settings : action.comp
  const comp = action.comp.id ? action.comp : {}
  const settingsClone = JSON.parse(JSON.stringify(settings))

  let item = state.items[state.current]
  const newSettings = {
    ...item.settings,
    ...settingsClone,
  }
  const newState = {
    ...state,
    items: {
      ...state.items,
      [state.current]: {
        ...item,
        destination: setFilePath(state, item.destination, comp.destination, item.name, getSimpleSeparator()),
        absoluteURI: setFilePath(state, item.absoluteURI, comp.absoluteURI, item.name, '/'),
        settings: newSettings,
      }
    }
  }
  return newState
}

/*function updateExportMode(state, action) {
  let newItem = {...state.items[state.current]}
  let newSettings = {...newItem.settings}
  newSettings.export_mode = action.exportMode
  if (newItem.destination) {
    if (newSettings.export_mode === ExportModes.STANDALONE) {
      newItem.destination = newItem.destination.replace(extensionReplacer,'.js')
      newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.js')
    } else if (newSettings.export_mode === ExportModes.STANDARD){
      newItem.destination = newItem.destination.replace(extensionReplacer,'.json')
      newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.json')
    } else {
      if (newSettings.banner.zip_files) {
        newItem.destination = newItem.destination.replace(extensionReplacer,'.zip')
        newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.zip')
      } else {
        newItem.destination = newItem.destination.replace(extensionReplacer,'.json')
        newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.json')
      }
    }
  }
  newItem.settings = newSettings
  let newItems = {...state.items}
  newItems[state.current] = newItem
  let newState = {...state}
  newState.items = newItems
  return newState
}*/

function toggleMode(state, action) {
  let newItem = {...state.items[state.current]}
  let newSettings = {...newItem.settings}
  const mode = action.value
  newSettings.export_modes = {
    ...newSettings.export_modes,
    [mode]: !newSettings.export_modes[mode]
  }
  newItem.settings = newSettings
  ////
  if (newItem.destination) {
    if (newSettings.export_modes.standalone) {
      newItem.destination = newItem.destination.replace(extensionReplacer,'.js')
      newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.js')
    } else if (newSettings.export_modes.banner && newSettings.banner.zip_files){
      newItem.destination = newItem.destination.replace(extensionReplacer,'.zip')
      newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.zip')
    } else {
      newItem.destination = newItem.destination.replace(extensionReplacer,'.json')
      newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.json')
    }
  }
  ////
  let newItems = {...state.items}
  newItems[state.current] = newItem
  return {
    ...state,
    items: newItems
  }
}

function updateBanner(state, action) {
  let newItem = {...state.items[state.current]}
  let newSettings = {...newItem.settings}
  const newBanner = {...newSettings.banner}
  if (action.type === actionTypes.SETTINGS_BANNER_WIDTH_UPDATED) {
    newBanner.width = action.value
  } else if (action.type === actionTypes.SETTINGS_BANNER_HEIGHT_UPDATED) {
    newBanner.height = action.value
  } else if (action.type === actionTypes.SETTINGS_BANNER_ORIGIN_UPDATED) {
    newBanner.lottie_origin = action.value
  } else if (action.type === actionTypes.SETTINGS_BANNER_VERSION_UPDATED) {
    newBanner.lottie_library = action.value
  } else if (action.type === actionTypes.SETTINGS_BANNER_LIBRARY_PATH_UPDATED) {
    newBanner.lottie_path = action.value
  } else if (action.type === actionTypes.SETTINGS_BANNER_RENDERER_UPDATED) {
    newBanner.lottie_renderer = action.value
  } else if (action.type === actionTypes.SETTINGS_BANNER_CLICK_TAG_UPDATED) {
    newBanner.click_tag = action.value
  } else if (action.type === actionTypes.SETTINGS_BANNER_ZIP_FILES_UPDATED) {
    newBanner.zip_files = !newBanner.zip_files
  } else if (action.type === actionTypes.SETTINGS_BANNER_INCLUDE_DATA_IN_TEMPLATE_UPDATED) {
    newBanner.shouldIncludeAnimationDataInTemplate = !newBanner.shouldIncludeAnimationDataInTemplate
  } else if (action.type === actionTypes.SETTINGS_BANNER_CUSTOM_SIZE_UPDATED) {
    newBanner.use_original_sizes = !newBanner.use_original_sizes
  } else if (action.type === actionTypes.SETTINGS_BANNER_LOOP_TOGGLE) {
    newBanner.shouldLoop = !newBanner.shouldLoop
  } else if (action.type === actionTypes.SETTINGS_BANNER_LOOP_COUNT_CHANGE) {
    newBanner.loopCount = action.value
  } else if (action.type === actionTypes.SETTINGS_BANNER_LIBRARY_FILE_SELECTED) {
    newBanner.localPath = action.value
  }
  if (action.type === actionTypes.SETTINGS_BANNER_ORIGIN_UPDATED 
    || action.type === actionTypes.SETTINGS_BANNER_VERSION_UPDATED) 
  {
    if ([LottieLibraryOrigins.LOCAL, LottieLibraryOrigins.CDNJS].includes(newBanner.lottie_origin)) {
      const lottieVersion = findLottieVersion(newBanner.lottie_library)
      if (!lottieVersion.renderers.includes(newBanner.lottie_renderer)) {
        newBanner.lottie_renderer = lottieVersion.renderers[0]
      }
    }
  }
  newSettings.banner = newBanner
  newItem.settings = newSettings
  let newItems = {...state.items}
  newItems[state.current] = newItem

  if (action.type === actionTypes.SETTINGS_BANNER_ZIP_FILES_UPDATED) {
    if (newBanner.zip_files) {
      newItem.destination = newItem.destination.replace(extensionReplacer,'.zip')
      newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.zip')
    } else {
      newItem.destination = newItem.destination.replace(extensionReplacer,'.json')
      newItem.absoluteURI = newItem.absoluteURI.replace(extensionReplacer,'.json')
    }
  }

  return {
    ...state,
    items: newItems
  }

}

function updateDemo(state, action) {

  let newItem = {...state.items[state.current]}
  let newSettings = {...newItem.settings}
  const newDemoData = {...newSettings.demoData}
  newDemoData.backgroundColor = action.value
  newSettings.demoData = newDemoData
  newItem.settings = newSettings 
  let newItems = {...state.items}
  newItems[state.current] = newItem
  return {
    ...state,
    items: newItems
  }
}

function toggleCompNameAsDefault(state, action) {
  return {
    ...state,
    shouldUseCompNameAsDefault: !state.shouldUseCompNameAsDefault,
  }
}

function toggleAEPathAsDestinationFolder(state, action) {
  return {
    ...state,
    shouldUseAEPathAsDestinationFolder: !state.shouldUseAEPathAsDestinationFolder,
  }
}

function toggleSettingSCopy(state, action) {
  return {
    ...state,
    shouldKeepCopyOfSettings: !state.shouldKeepCopyOfSettings,
  }
}

function toggleDefaultFolder(state, action) {
  return {
    ...state,
    shouldUsePathAsDefaultFolder: !state.shouldUsePathAsDefaultFolder,
  }
}
function toggleIncludeCompNameAsFolder(state, action) {
  return {
    ...state,
    shouldIncludeCompNameAsFolder: !state.shouldIncludeCompNameAsFolder,
  }
}

function toggleSaveInProjectFile(state, action) {
  return {
    ...state,
    shouldSaveInProjectFile: !state.shouldSaveInProjectFile,
  }
}

function toggleSkipDoneView(state, action) {
  return {
    ...state,
    shouldSkipDoneView: !state.shouldSkipDoneView,
  }
}

function toggleReuseFontData(state, action) {
  return {
    ...state,
    shouldReuseFontData: !state.shouldReuseFontData,
  }
}

function setDefaultFolderPath(state, action) {
  return {
    ...state,
    defaultFolderPath: action.value,
  }
}

function setSettingsDestinationPath(state, action) {
  return {
    ...state,
    settingsDestinationCopy: action.value,
  }
}

function storeReportsPath(state, action) {
  var comp = {
    ...state.items[action.compId],
    reportPath: action.reportPath,
  } || {}
  return {
    ...state,
    items: {
      ...state.items,
      [action.compId]: comp,
    }
  }
}

const defaultMetadataCustomProp = {
  name: '',
  active: true,
  value: 1,
}

function addMetadataCustomProp(state) {
  const item = state.items[state.current]
  return {
    ...state,
    items: {
      ...state.items,
      [state.current]: {
        ...item,
        settings: {
          ...item.settings,
          metadata: {
            ...item.settings.metadata,
            customProps: [
              ...item.settings.metadata.customProps,
              {
                ...defaultMetadataCustomProp,
                name: `Custom Property ${item.settings.metadata.customProps.length + 1}`,
                id: random(10),
              }
            ]
          }
        }
      }
    }
  }
}

function deleteMetadataCustomProp(state, action) {
  const item = state.items[state.current]
  return {
    ...state,
    items: {
      ...state.items,
      [state.current]: {
        ...item,
        settings: {
          ...item.settings,
          metadata: {
            ...item.settings.metadata,
            customProps: item.settings.metadata.customProps.filter(item => item.id !== action.id)
          }
        }
      }
    }
  }
}

function updateMetadataCustomPropTitle(state, action) {
  const item = state.items[state.current]
  return {
    ...state,
    items: {
      ...state.items,
      [state.current]: {
        ...item,
        settings: {
          ...item.settings,
          metadata: {
            ...item.settings.metadata,
            customProps: item.settings.metadata.customProps.map(item => {
              if(item.id === action.id) {
                return {
                  ...item,
                  name: action.value,
                }
              }
              return item
            })
          }
        }
      }
    }
  }
}

function updateMetadataCustomPropValue(state, action) {
  const item = state.items[state.current]
  return {
    ...state,
    items: {
      ...state.items,
      [state.current]: {
        ...item,
        settings: {
          ...item.settings,
          metadata: {
            ...item.settings.metadata,
            customProps: item.settings.metadata.customProps.map(item => {
              if(item.id === action.id) {
                return {
                  ...item,
                  value: action.value,
                }
              }
              return item
            })
          }
        }
      }
    }
  }
}

function setCompsSelection(state, value) {
  const items = state.items
  const itemKeys = Object.keys(items)
  const newItems = itemKeys.reduce((accumulator, key) => {
    const item = items[key]
      accumulator[key] = {
        ...item,
        selected: value,
      }
    return accumulator
  }, {})
  return {
    ...state,
    items: newItems,
  }
}

function selectAllComps(state, action) {
  return setCompsSelection(state, true);
}

function unselectAllComps(state, action) {
  return setCompsSelection(state, false);
}

function deleteTemplate(state, action) {
  const templates = state.templates;
  const list = templates.list;
  const templateIndex = list.findIndex(template => template.value === action.value)
  return {
    ...state,
    templates: {
      ...state.templates,
      list: [ ...list.slice(0, templateIndex), ...list.slice(templateIndex + 1) ]
    }
  }
}

function addTemplate(state, action) {
  const templates = state.templates;
  const list = templates.list;
  return {
    ...state,
    templates: {
      ...state.templates,
      list: [ ...list, action.templateData]
    }
  }
}

function handleTemplateError(state, action) {
  const item = state.items[action.compId];
  const newItem = {
    ...item,
    settings: {
      ...item.settings,
      template: {
        ...item.settings.template,
        errors: action.errors,
      }
    }

  }
  return {
    ...state,
    items: {
      ...state.items,
      [action.compId]: newItem,
    },
  }
}

export default function compositions(state = initialState, action) {
  switch (action.type) {
    case actionTypes.COMPOSITIONS_UPDATED:
      return addCompositions(state, action)
    case actionTypes.COMPOSITIONS_FILTER_CHANGE:
      return updateFilter(state, action)
    case actionTypes.COMPOSITIONS_TOGGLE_ITEM:
      return toggleComposition(state, action)
    case actionTypes.COMPOSITION_SET_DESTINATION:
      return setCompositionDestination(state, action)
    case actionTypes.RENDER_START:
      return startRender(state, action)
    case actionTypes.RENDER_COMPLETE:
      return completeRender(state, action)
    case actionTypes.PROJECT_STORED_DATA:
    case actionTypes.SETTINGS_LOADED:
      return setStoredData(state, action)
    case actionTypes.COMPOSITION_DISPLAY_SETTINGS:
    case actionTypes.COMPOSITIONS_SET_CURRENT_COMP_ID:
      return setCurrentComp(state, action)
    case actionTypes.SETTINGS_CANCEL:
      return cancelSettings(state, action)
    case actionTypes.SETTINGS_TOGGLE_VALUE:
      return toggleSettingsValue(state, action)
    case actionTypes.SETTINGS_TOGGLE_EXTRA_COMP:
      return toggleExtraComp(state, action)
    case actionTypes.SETTINGS_UPDATE_VALUE:
      return updateSettingsValue(state, action)
    case actionTypes.SETTINGS_COMP_NAME_AS_DEFAULT_TOGGLE:
      return toggleCompNameAsDefault(state, action)
    case actionTypes.SETTINGS_AE_AS_PATH_TOGGLE:
      return toggleAEPathAsDestinationFolder(state, action)
    case actionTypes.SETTINGS_PROJECT_SETTINGS_COPY:
      return toggleSettingSCopy(state, action)
    case actionTypes.SETTINGS_PATH_AS_DEFAULT_FOLDER:
      return toggleDefaultFolder(state, action)
    case actionTypes.SETTINGS_INCLUDE_COMP_NAME_AS_FOLDER_TOGGLE:
      return toggleIncludeCompNameAsFolder(state, action)
    case actionTypes.SETTINGS_DEFAULT_FOLDER_PATH_SELECTED:
      return setDefaultFolderPath(state, action)
    case actionTypes.SETTINGS_COPY_PATH_SELECTED:
      return setSettingsDestinationPath(state, action)
    case actionTypes.SETTINGS_TOGGLE_SELECTED:
      return toggleSelected(state, action)
    case actionTypes.SETTINGS_APPLY_FROM_CACHE:
      return applySettingsFromCache(state, action)
    case actionTypes.SETTINGS_BANNER_WIDTH_UPDATED:
    case actionTypes.SETTINGS_BANNER_HEIGHT_UPDATED:
    case actionTypes.SETTINGS_BANNER_ORIGIN_UPDATED:
    case actionTypes.SETTINGS_BANNER_VERSION_UPDATED:
    case actionTypes.SETTINGS_BANNER_LIBRARY_PATH_UPDATED:
    case actionTypes.SETTINGS_BANNER_RENDERER_UPDATED:
    case actionTypes.SETTINGS_BANNER_CLICK_TAG_UPDATED:
    case actionTypes.SETTINGS_BANNER_ZIP_FILES_UPDATED:
    case actionTypes.SETTINGS_BANNER_INCLUDE_DATA_IN_TEMPLATE_UPDATED:
    case actionTypes.SETTINGS_BANNER_CUSTOM_SIZE_UPDATED:
    case actionTypes.SETTINGS_BANNER_LOOP_TOGGLE:
    case actionTypes.SETTINGS_BANNER_LOOP_COUNT_CHANGE:
    case actionTypes.SETTINGS_BANNER_LIBRARY_FILE_SELECTED:
      return updateBanner(state, action)
    case actionTypes.SETTINGS_MODE_TOGGLE:
      return toggleMode(state, action)
    case actionTypes.REPORTS_SAVED:
      return storeReportsPath(state, action)
    case actionTypes.SETTINGS_DEMO_BACKGROUND_COLOR_CHANGE:
      return updateDemo(state, action)
    case actionTypes.SETTINGS_METADATA_CUSTOM_PROP_ADD:
      return addMetadataCustomProp(state, action)
    case actionTypes.SETTINGS_METADATA_CUSTOM_PROP_DELETE:
      return deleteMetadataCustomProp(state, action)
    case actionTypes.SETTINGS_METADATA_CUSTOM_PROP_TITLE_CHANGE:
      return updateMetadataCustomPropTitle(state, action)
    case actionTypes.SETTINGS_METADATA_CUSTOM_PROP_VALUE_CHANGE:
      return updateMetadataCustomPropValue(state, action)
    case actionTypes.COMPOSITIONS_SELECT_ALL:
      return selectAllComps(state, action)
    case actionTypes.COMPOSITIONS_UNSELECT_ALL:
      return unselectAllComps(state, action)
    case actionTypes.SETTINGS_SAVE_IN_PROJECT_FILE:
      return toggleSaveInProjectFile(state, action)
    case actionTypes.SETTINGS_SKIP_DONE_VIEW:
      return toggleSkipDoneView(state, action)
    case actionTypes.SETTINGS_REUSE_FONT_DATA:
      return toggleReuseFontData(state, action)
    case actionTypes.SETTINGS_TEMPLATES_DELETE:
      return deleteTemplate(state, action)
    case actionTypes.SETTINGS_TEMPLATES_LOADED:
      return addTemplate(state, action)
    case actionTypes.RENDER_TEMPLATE_ERROR:
      return handleTemplateError(state, action)
    default:
      return state
  }
}
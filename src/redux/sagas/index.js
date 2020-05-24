import { all } from 'redux-saga/effects'
import compositions from './composition_sagas'
import project from './project_sagas'
import preview from './preview_sagas'
import render from './render_sagas'
import importFiles from './import_sagas'

export default function* rootSaga() {	
  yield all([
  	...compositions,
  	...project,
  	...preview,
  	...render,
  	...importFiles,
  ])
}
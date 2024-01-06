import React from 'react'
import {connect} from 'react-redux'
import { StyleSheet, css } from 'aphrodite'
import {
	initialize,
  finalize, 
} from '../../redux/actions/supportedFeaturesActions'
import supported_features_selector from '../../redux/selectors/supported_features_view_selector'
import BaseHeader from '../../components/header/Base_Header'
import Variables from '../../helpers/styles/variables'
import {openInBrowser} from '../../helpers/CompositionsProvider'

const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
		height: '100%',
    padding: '10px 10px 30px 10px',
		backgroundColor: '#474747',
		display: 'flex',
    flexDirection:'column',
    color: Variables.colors.white,
	},
	header: {
		flex: '0 0 auto',
	},
	infoContainer: {
		flex: '1 1 auto',
		height: '100%',
		display: 'flex',
    flexDirection:'column',
    minHeight: 0,
	},
	frameContainer: {
		height: '100%',
		width: '100%',
	},
  instructionsContainer: {
		height: '100%',
		width: '100%',
    padding: '8px',
  },
  dropdown: {
    margin: '8px 0',
  },
})

class SupportedFeatures extends React.Component {

  state = {
    selectedFeature: null,
  }

  updateSelectedFeature = () => {
    if (!this.state.selectedFeature && this.props.features.length) {
      this.setState({
        selectedFeature: this.props.features[0]
      })
    } else if (this.state.selectedFeature && !this.props.features.length) {
      this.setState({
        selectedFeature: null
      })
    } else if (this.state.selectedFeature) {
      const feature = this.props.features.find(feature => feature.matchName === this.state.selectedFeature.matchName)
      if (!feature) {
        this.setState({
          selectedFeature: this.props.features[0]
        })
      } else if(this.state.selectedFeature !== feature) {
        this.setState({
          selectedFeature: feature
        })
      }
    }
  }

  componentDidMount() {
    this.props.initialize()
    this.updateSelectedFeature()
  }

  componentWillUnmount() {
    this.props.finalize()
  }

  componentDidUpdate() {
    this.updateSelectedFeature()
  }

  handleChange = (ev) => {
    this.setState({
      selectedFeature: this.props.features.find(feature => feature.matchName === ev.target.value)
    })
  }

  buildFeaturesInfo(features) {
    if(!features.length || !this.state.selectedFeature) {
      return null;
    }
    return (
      <select 
        className={css(styles.dropdown)} 
        onChange={this.handleChange}
        value={this.state.selectedFeature.matchName}
      >
        {features.map(option => (
          <option 
            key={option.matchName} 
            value={option.matchName}
          >
            {option.name}
          </option>))}
      </select>
    )
  }

  setRef(elem) {
    if (elem) {
      if (elem.contentWindow) {
        window.addEventListener('message', function(ev) {
          if (ev.data.name === 'lottieEvent') {
            var payload = ev.data.payload;
            if (payload.type === 'link') {
              openInBrowser(payload.link);
            }
          }
        })
      }
    }
  }

  buildInfo() {
    if (!this.state.selectedFeature) {
      return (
        <div className={css(styles.instructionsContainer)}>
            <div>Select one or more properties from your composition to get information about their support</div>
        </div>
      );
    }
    if (!this.state.selectedFeature.link) {
      return  (
        <div className={css(styles.missingDataContainer)}>
          <div>No data for this property</div>
        </div>
      )
    }
    return (
      <iframe
        src={`${this.state.selectedFeature.link}?mode=embed`}
        className={css(styles.frameContainer)}
        ref={this.setRef}
      />
    )
  }

	render() {
    // console.log(this.props.features.map(f => `"${f.matchName}"`).join(","));
		return (
			<div className={css(styles.wrapper)}>
        <div className={css(styles.header)} >
          <BaseHeader />
				</div>
        {this.buildFeaturesInfo(this.props.features)}
        <div className={css(styles.infoContainer)}>
          {this.buildInfo()}
        </div>
			</div>
			)
	}
}

function mapStateToProps(state) {
	return supported_features_selector(state)
}

const mapDispatchToProps = {
	initialize: initialize,
	finalize: finalize,
}

export default connect(mapStateToProps, mapDispatchToProps)(SupportedFeatures)

import React from 'react'
import {connect} from 'react-redux'
import { StyleSheet, css } from 'aphrodite'
import BaseButton from '../../components/buttons/Base_button'
import Bodymovin from '../../components/bodymovin/bodymovin'
import anim from '../../assets/animations/bm.json'
import {openInBrowser, getPlayer} from '../../helpers/CompositionsProvider'
import Variables from '../../helpers/styles/variables'
import {goToComps, clearCache} from '../../redux/actions/compositionActions'
import BaseHeader from '../../components/header/Base_Header'

const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection:'column',
      padding: '10px 10px 30px 10px',
      backgroundColor :'#474747'
    },
    back_container: {
      display: 'flex',
      justifyContent: 'space-between',

    },
    anim_container: {
      textAlign: 'center'
    },
    bm_container: {
      width: '80px',
      height: '80px',
      display: 'inline-block'
    },
    text_container: {
      paddingBottom: '15px',
      textAlign: 'center'
    },
    text_title: {
      color: Variables.colors.white,
      fontFamily: 'Roboto-Black',
      paddingBottom: '25px',
      fontSize: '14px'
    },
    text_par: {
      color: '#fff',
      fontSize: '10px',
      lineHeight:'14px'
    },
    link: {
      color: Variables.colors.green
    },
    buttons_container: {
      textAlign: 'center',
      marginBottom: '16px',
    },
    buttonSeparator: {
      width: '10px',
      display: 'inline-block'
    }
})

class Player extends React.Component {

  openInBrowser(){
    openInBrowser('https://github.com/airbnb/lottie-web')
  }
  
  getPlayer(){
    getPlayer(false)
  }

  getPlayerZipped(){
    getPlayer(true)
  }

  render() {
    return (
      <div className={css(styles.container)}>
        <BaseHeader />
        <div className={css(styles.back_container)}>
          <BaseButton text={'Clear Caché'} type='green' onClick={this.props.clearCache} />
        </div>
        <div className={css(styles.anim_container)}>
          <Bodymovin animationData={anim} autoplay={true} loop={true}>
            <div className={css(styles.bm_container)}></div>
          </Bodymovin>
        </div>
        <div className={css(styles.text_container)}>
            <div className={css(styles.text_title)}>Bodymovin</div>
            <div className={css(styles.text_par)}>
              <p>This plugin exports After Effects animations to a web compatible format.</p>
              <p>In order to play the exported animation on your browser follow the instructions at 
                <a className={css(styles.link)} href='#' onClick={this.openInBrowser}> Lottie on github</a>
              </p>
              <br />
              <p>You can get the latest version of the player from the repository or copy the one included in the extension here.</p>
            </div>
        </div>
        <div className={css(styles.buttons_container)}>
          <BaseButton text={'Get the Player'} type='green' onClick={this.getPlayer} />
          <div className={css(styles.buttonSeparator)}></div>
          <BaseButton text={'Get the Player Gzipped'} type='green'  onClick={this.getPlayerZipped}/>
        </div>
      </div>
      );
  }
}
const mapDispatchToProps = {
  goToComps: goToComps,
  clearCache: clearCache,
}

export default connect(null, mapDispatchToProps)(Player)

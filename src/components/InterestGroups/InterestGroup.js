import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux';
import { Button, Container, Row, Col } from 'reactstrap';
import EventCard from '../Events/EventCard'
import UserCard from '../Users/UserCard'
import { getInterestGroup, getFile, getGroupEvents, getUserProfile } from '../../utils/actions'
import { formatEvents } from '../../utils/utils'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import { withRouter } from 'react-router-dom'
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';

class InterestGroup extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      igID: this.props.match.params.igID,
      logo: null,
    }
  }

  componentWillMount() {
    const { igID } = this.state
    const { history } = this.props
    const { firestore } = this.context.store

    getInterestGroup(firestore, igID, (snapshot) => {
      if (!snapshot.exists) {
        history.push('/interestgroups')
      } else {
        getUserProfile(firestore, snapshot.data().leaderID, (snapshot) => {})
      }
    })

    getGroupEvents(firestore, igID)
  }

  showInterestGroup = () => {
    const { logo } = this.state
    const { interestGroup, igTypes, firebase, history, events, eventTypes, spaces, userProfile, auth } = this.props
    const { name, type, description, activities, leader } = interestGroup

    const isLeader = firebase.auth ? leader === firebase.auth.uid : false
    const signedIn = isLoaded(auth) && !isEmpty(auth)

    if (!logo && interestGroup.logo) {
      getFile(firebase, interestGroup.logo, (url) => {
        this.setState({
          logo: url,
        })
      })
    }

    return <Col>
      <Container>
        <Row>
          {
            logo ?
            <Col xs="12" md="3" className="pr-0">
              <img src={logo} className="mb-0" alt="Avatar" />
            </Col>
            : ''
          }
          <Col xs="12" md={logo ? "9" : "12"}>
            <h2 style={{fontWeight: 300}}>{ name }</h2>
              <p className="lead">{ description }</p>
              <p>{ activities }</p>
          </Col>
        </Row>
        <Row>
          <Col>
            <hr className="my-2" />
            {
              userProfile ?
                <h3 className="mt-3">IG Head</h3>
              : ''
            }
          </Col>
        </Row>
        <Row className="mb-3">
            {
              userProfile ?
                <Col xs="12" md="4">
                  <div>
                    <UserCard user={userProfile} hideContact={!signedIn} />
                  </div>
                </Col>
              : ''
            }
          <Col xs="12" md={{size: 4, offset: 4}}>
            <div className="d-flex align-items-center justify-content-end">
              <div>
                <Button outline color="primary" className="mb-1" disabled={!signedIn}><FontAwesomeIcon icon="comments" /> { ' ' }Join Chat Group</Button>
                <br/>
                <div className="d-flex justify-content-end">
                  <Button outline color="primary" className="mt-1" disabled={!signedIn}><FontAwesomeIcon icon="sign-in-alt" />{ ' ' }Join IG</Button>
                </div>
                { !signedIn
                  ? <div>
                      <p><small>Please Sign In</small></p>
                    </div>
                  : ''
                }
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Our Events</h3>
            {
              events ?
                events.map((event) => <EventCard
                  key={event.id}
                  event={event}
                  eventTypes={eventTypes}
                  spaces={spaces}
                  buttonText='See More'
                  firebase={firebase}
                  hasModal={true} />)
              : <h4><FontAwesomeIcon icon="frown" /> There are currently no events for this Interest Group.</h4>
            }
          </Col>
        </Row>
      </Container>
    </Col>
  }

  render() {
    const { interestGroup, firebase, history, requesting } = this.props

    return(<Container>
      <Row className="mt-3 mb-3">
        {
          isLoaded(interestGroup) && interestGroup ?
            this.showInterestGroup()
          : <h4><FontAwesomeIcon icon="spinner" spin /> Loading...</h4>
        }
      </Row>
    </Container>)
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
    interestGroup: state.firestore.data.interestGroup,
    igTypes: state.firestore.data.igTypes,
    events: formatEvents(state.firestore, 'groupEvents', true),
    eventTypes: state.firestore.data.eventTypes,
    spaces: state.firestore.data.spaces,
    userProfile: state.firestore.data.userProfile
  }
}

export default withRouter(compose(
  firebaseConnect(),
  connect(mapStateToProps)
)(InterestGroup))

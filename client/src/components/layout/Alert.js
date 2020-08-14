import React from 'react';
import PropTypes from 'prop-types';
//Connects component to Redux
import { connect } from 'react-redux';

const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div
      key={alert.id}
      className={`alert alert-${alert.alertType}`}
    >
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

//Fetch the alert state from the 'redux dev tool array' into this component
//mapping the redux state to ----> this props so that we have access to it
const mapStateToProps = (state) => ({
  alerts: state.alert,
});

export default connect()(Alert);
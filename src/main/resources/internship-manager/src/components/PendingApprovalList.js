import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { withSnackbar } from 'notistack';

import AuthenticationService from '../services/AuthenticationService';
import Validator from '../utils/Validator';
import Lock from '../utils/Lock'
import Copyright from './Copyright';

import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Container from '@material-ui/core/Container';
import LockOutlined from '@material-ui/icons/LockOutlined';
import InternshipOfferService from "../services/InternshipOfferService";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import * as ReactBootStrap from "react-bootstrap";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import ThumbUpAltOutlinedIcon from '@material-ui/icons/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@material-ui/icons/ThumbDownAltOutlined';
import { Divider } from "@material-ui/core";

//
// Data
//

const state = {
  internshipOffers: []
}

class PendingApprovalList extends Component {

  //
  // Constructors
  //

  constructor(props) {
    super();
    this.state = state;
    this.onUpdateInternshipOffers();

    this.submitLock = new Lock();
  }

  //
  // Event Handlers
  //

  onUpdateInternshipOffers() {

    InternshipOfferService.pendingApproval().then(response => {
      this.setState(response.data);
    });

  }

  onApprovedClicked(internshipOffer) {
    InternshipOfferService.approve(internshipOffer).then(response => {
      this.onUpdateInternshipOffers();
      this.props.enqueueSnackbar("Offre de " + internshipOffer.company + " approuvé",  { variant: 'success' });
    });
  }

  onRejectedClicked(internshipOffer) {
    InternshipOfferService.reject(internshipOffer).then(response => {
      this.onUpdateInternshipOffers();
      this.props.enqueueSnackbar("Offre de " + internshipOffer.company + " rejeté",  { variant: 'success' });
    });
  }

  //
  // Rendering
  //

  render() {
    return (
      <div>
        <Container>
          <Box
            mb={2}
            paddingTop={2}
            textAlign="left"
          >
            <Typography component="h1" variant="h4" align="center">Offre en attente</Typography>
          </Box>
        </Container>

        <TableContainer>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell width="40%" align="center"><strong>Poste</strong></TableCell>
                <TableCell width="60%" align="center"><strong>Détails</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.internshipOffers.map((offer, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row" style={{ verticalAlign: 'top' }} align="left">
                    <p><strong>Compagnie: </strong>{offer.company}</p>
                    <p><strong>Titre: </strong>{offer.jobTitle}</p>
                    <Box
                      style={{ backgroundColor: 'lightgray' }}
                      padding={1}>
                      <Typography>Actions</Typography>
                      <Divider></Divider>
                      <Box margin={1}>

                        <Button
                          variant="contained" color="primary"
                          size="small" startIcon={<ThumbUpAltOutlinedIcon />}
                          onClick={() => this.onApprovedClicked(offer)}
                        >
                          Approuver
                        </Button>
                      </Box>

                      <Box margin={1}>
                        <Button
                          variant="contained" color="secondary"
                          size="small"
                          startIcon={<ThumbDownAltOutlinedIcon />} onClick={() => this.onRejectedClicked(offer)}
                        >
                          Rejeter
                      </Button>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell component="th" scope="row" style={{ verticalAlign: 'top' }} align="left">
                    <p><strong>Début: </strong>{new Date(offer.startDate).toLocaleDateString()} <strong>Fin: </strong>{new Date(offer.endDate).toLocaleDateString()}</p>
                    <p><strong>Lieu du stage: </strong>{offer.location}</p>
                    <p><strong>Salaires: </strong>{offer.salary.toFixed(2) + '$'} <strong>Heures: </strong>{offer.hours}</p>
                    <p><strong>Portée de travail: </strong>{offer.jobScope.map(scope => (<li style={{}}>{scope}</li>))}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    )
  }
}

export default withSnackbar(withRouter(PendingApprovalList));
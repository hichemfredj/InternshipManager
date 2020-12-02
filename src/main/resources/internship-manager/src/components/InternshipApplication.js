import React, { useEffect, useState } from "react";
import { useHistory, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import InternshipApplicationService from "../services/InternshipApplicationService";
import InternshipOfferService from "../services/InternshipOfferService";
import ContractService from "../services/ContractService";

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Link from '@material-ui/core/Link';

import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';

export default function InternshipApplication() {

    const { uuid } = useParams();
    const history = useHistory()

    const { enqueueSnackbar } = useSnackbar();

    const [application, setApplication] = useState({});
    const [offer, setOffer] = useState({});

    const [contracts, setContracts] = useState([]);

    const fetch = () => {
        InternshipApplicationService.find(uuid).then(response => {

            setApplication(response.data);

            InternshipOfferService.find(response.data.offerUniqueId).then(response1 => {
                setOffer(response1.data);
            })

            ContractService.allContracts(response.data.studentUniqueId).then(response1 => {
                setContracts(response1.data.contracts);
            })

        })
    }

    const onInterviewDateChange = date => {
        InternshipApplicationService.addInterview(uuid, date.getTime()).then(response => {
            fetch();
        })
    }

    const generateContract = () => {
        ContractService.create(uuid).then(response => {
            fetch();
            enqueueSnackbar(`Nouveau contrat généré`, { variant: 'success' });
        });
    }

    const approve = () => {
        InternshipApplicationService.approve(uuid).then(response => {
            fetch();
            enqueueSnackbar(`Application approuvé`, { variant: 'success' });
        });
    }

    const reject = () => {
        InternshipApplicationService.reject(uuid).then(response => {
            fetch();
            enqueueSnackbar(`Application rejeté`, { variant: 'success' });
        });
    }

    const select = () => {
        InternshipApplicationService.select(uuid).then(response => {
            fetch();
            enqueueSnackbar(`Application selectionné`, { variant: 'success' });
        });
    }

    const canGenerateContract = () => {
        return application.status == "SELECTED" && localStorage.getItem('UserType') === "ADMINISTRATOR";
    }

    const canApprove = () => {
        return application.status == "PENDING_APPROVAL" && localStorage.getItem('UserType') === "ADMINISTRATOR";
    }

    const canReject = () => {
        return application.status == "PENDING_APPROVAL" && localStorage.getItem('UserType') === "ADMINISTRATOR";
    }

    const canSelect = () => {

        return application.status == "APPROVED" && localStorage.getItem('UserUniqueId') === offer.employer;
    }

    const translateStatus = (status) => {
        switch (status) {
            case "PENDING_APPROVAL": return "En attente d'approbation";
            case "APPROVED": return "En attente de selection";
            case "REJECTED": return "Rejeté";
            case "SELECTED": return "Application selectionné!";
        }
    }

    useEffect(() => { fetch(); }, [])

    return (
        <div>
            <IconButton
                onClick={() => history.goBack()}>
                <KeyboardBackspaceIcon />
                <Typography>Retour</Typography>
            </IconButton>

            <Container>
                <Box
                    margin={2}
                    textAlign="center">

                    <Typography variant="h3">Application</Typography>
                    <Typography
                        style={{ color: "gray" }}
                        variant="subtitle1">{uuid}</Typography>
                </Box>

                <Box
                    marginTop={2}
                    textAlign="center">
                    <Box
                        marginBottom={1}
                        style={{ backgroundColor: "lightsteelblue" }}>
                        <Typography>{translateStatus(application.status)}</Typography>
                    </Box>
                </Box>

                <Box
                    margin={1}
                    textAlign="center"
                >
                    {
                        canGenerateContract() &&
                        <Button
                            style={{ margin: '4px' }}
                            variant="contained" color="secondary"
                            size="small"
                            onClick={generateContract}>
                            Généré Contrat
                        </Button>
                    }
                    {
                        canSelect() &&
                        <Button
                            style={{ margin: '4px' }}
                            variant="contained" color="secondary"
                            size="small"
                            onClick={select}>
                            Selectionner
                        </Button>
                    }
                    {
                        canApprove() &&
                        <Button
                            style={{ margin: '4px' }}
                            variant="contained" color="secondary"
                            size="small"
                            onClick={approve}>
                            Approuvé
                        </Button>
                    }
                    {
                        canReject() &&
                        <Button
                            style={{ margin: '4px' }}
                            variant="contained" color="secondary"
                            size="small"
                            onClick={reject}>
                            Rejeté
                        </Button>
                    }
                </Box>

                <Box>

                    <Box
                        marginTop={2}
                        textAlign="center"
                        style={{ backgroundColor: "lightgray" }}>
                        <Typography>Informations Générale</Typography>
                    </Box>

                    <Table size="small">

                        <TableHead>
                            <TableCell width="30%"></TableCell>
                            <TableCell width="70%"></TableCell>
                        </TableHead>

                        <TableRow>
                            <TableCell align="left"><strong>Offre de stage</strong></TableCell>
                            <TableCell align="right">
                                {
                                    offer.company &&

                                    <Link
                                        onClick={() => history.push(`/internship-offer/${offer.uniqueId}`)}>
                                        {offer.company + " | " + offer.jobTitle}
                                    </Link>
                                }
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell align="left"><strong>Étudiant</strong></TableCell>
                            <TableCell align="right">
                                {
                                    application.studentFirstName &&

                                    <Link
                                        onClick={() => history.push(`/user/${application.studentUniqueId}`)}>
                                        {application.studentFirstName + " " + application.studentLastName}
                                    </Link>
                                }
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell align="left"><strong>Date</strong></TableCell>
                            <TableCell align="right">{new Date(application.date).toLocaleDateString()}</TableCell>
                        </TableRow>

                    </Table>

                    {
                        application.status == "SELECTED" &&

                        <Box>

                            <Box
                                marginTop={2}
                                textAlign="center"
                                style={{ backgroundColor: "lightgray" }}>
                                <Typography>Entrevue</Typography>
                            </Box>

                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                {application.interviewDate == 0 &&
                                    <KeyboardDatePicker
                                        disableToolbar
                                        variant="inline"
                                        format="MM/dd/yyyy"
                                        margin="normal"
                                        label="Date intervu"
                                        autoOk={true}
                                        value={null}
                                        onChange={onInterviewDateChange}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                }
                                {application.interviewDate > 0 &&
                                    <KeyboardDatePicker
                                        disableToolbar
                                        variant="inline"
                                        format="MM/dd/yyyy"
                                        margin="normal"
                                        label="Date intervu"
                                        autoOk={true}
                                        value={new Date(application.interviewDate)}
                                        onChange={onInterviewDateChange}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                }
                            </MuiPickersUtilsProvider>

                        </Box>
                    }

                    {
                        application.status == "SELECTED" &&
                        <div>
                            <Box
                                marginTop={2}
                                textAlign="center"
                                style={{ backgroundColor: "lightgray" }}>
                                <Typography>Contrats</Typography>
                            </Box>

                            <div>
                                {
                                    contracts.length > 0 &&
                                    <TableContainer>
                                        <Table size="small" aria-label="a dense table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell width="60%" align="center"><strong>Date de Génération</strong></TableCell>
                                                    <TableCell width="30%" align="center"><strong>Action</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {contracts.map((contract, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell component="th" scope="row" align="center">{new Date(contract.creationDate).toLocaleDateString()}</TableCell>
                                                        <TableCell component="th" scope="row" align="center">
                                                            <Button
                                                                variant="contained"
                                                                color="secondary"
                                                                size="small"
                                                                onClick={() => history.push(`/contract/${contract.uniqueId}`)}
                                                            >
                                                                voir
                                                        </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                }
                                {
                                    contracts.length == 0 &&
                                    <Box
                                        margin={2}>
                                        <Typography>Aucun contrat!</Typography>
                                    </Box>
                                }
                            </div>
                        </div>
                    }

                </Box>

                <Box paddingTop={2}></Box>

            </Container>
        </div>
    )
}
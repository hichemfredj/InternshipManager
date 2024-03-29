import React, { useEffect, useState, useRef } from "react";
import { useSnackbar } from 'notistack';
import "../App.css";

import Container from "@material-ui/core/Container";
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import SignaturePad from "react-signature-canvas";
import SignatureService from "../services/SignatureService";

export default function CreateSignature() {

    const [imageURL, setImageURL] = useState(null); // creer un state qui va contenir l'url de l'image

    const [open, setOpen] = useState(false);

    const sigCanvas = useRef({});

    const { enqueueSnackbar } = useSnackbar();


    /* 
        une fonction qui utilise la référence du canevas pour effacer le canevas
        via une méthode donnée par react-signature-canvas
    */

    const clear = () => sigCanvas.current.clear();


    /* 
        une fonction qui utilise la référence du canevas pour découper le canevas
        à partir d'espaces blancs via une méthode donnée par react-signature-canvas
        puis le sauvegarde dans notre statwe
    */

    const save = () => {

        let signature = sigCanvas.current.getCanvas();

        signature.toBlob(function (blob) {

            const request = {
                file: blob
            }
            SignatureService.upload(request).then((response) => {

                if(imageURL){
                    enqueueSnackbar("Signature changé", { variant: 'success' });
                }else{
                    enqueueSnackbar("Signature ajouté", { variant: 'success' });
                }

                setImageURL(signature.toDataURL("image/png"));
            });
        });

        handleClose();

    };

    const fetchSignature = () => {

        // download signature

        let uuid = localStorage.getItem("UserUniqueId");

        SignatureService.find(uuid).then(data => {

            if (data.data) {
                SignatureService.download(uuid).then((response) => {
                    let signature = new Blob([response.data], { type: response.headers['content-type'] }, "image.png");
                    setImageURL(URL.createObjectURL(signature))
                });
            }

        });

    }

    useEffect(() => { fetchSignature(); }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (

        <div>

            <Container>
                <Box
                    mb={2}
                    paddingTop={2}
                    textAlign="left"
                >
                    <Typography component="h1" variant="h4" align="center">Créer une signature</Typography>
                </Box>
            </Container>

            <Divider />

            <Box margin={1}>

                {
                    imageURL &&
                    <Button
                        variant="contained" color="primary"
                        size="small"
                        onClick={handleClickOpen}
                    >
                        Changer Signature
                    </Button>
                }

                {
                    !imageURL &&
                    <Button
                        variant="contained" color="primary"
                        size="small"
                        onClick={handleClickOpen}
                    >
                        Ajouter Signature
                    </Button>
                }

            </Box>


            <Dialog
                open={open}
                onClose={handleClose}
            >

                <DialogContent
                    style={{ backgroundColor: 'lightGray' }}
                >
                    <Typography>Veuillez signer sur la ligne noir</Typography>
                    <Divider></Divider>
                    <Box
                        style={{
                            borderBottom: "5px solid black",
                        }}
                    >
                        <SignaturePad
                            ref={sigCanvas}
                            canvasProps={{
                                className: "signatureCanvas"
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Fermer
                        </Button>
                    <Button onClick={save} color="primary">
                        Sauvegarder
                        </Button>
                    <Button onClick={clear} color="primary">
                        Enlever
                        </Button>
                </DialogActions>

            </Dialog>
            <br />
            <br />
            {/* if our we have a non-null image url we should 
                show an image and pass our imageURL state to it*/}

            {imageURL ? (
                <Box
                    pb={8}
                >
                    <Box
                        mb={2}
                        paddingTop={2}
                        textAlign="center">
                        <Typography color="primary" variant="h6">Signature actuelle</Typography>
                    </Box>

                    <Box
                        id="mybox"

                        style={{
                            margin: "1",
                            width: "auto",
                            height: "auto",
                        }}>

                        <Box
                            padding={2}
                            style={{
                                margin: "0 auto",
                                // boxShadow : "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)",
                                width: "400px",
                                height: "250px",

                            }}
                        >
                            <img
                                src={imageURL}
                                alt="my signature"
                                style={{
                                    display: "block",
                                    margin: "auto",
                                    maxWidth: "400px",
                                    maxHeight: "250px",
                                    borderBottom: "5px solid black",
                                }}
                            />

                        </Box>

                    </Box>

                </Box>
            ) : <Box
                mb={2}
                paddingTop={2}
                textAlign="center">
                    <Typography color="primary" variant="h6">Aucune Signature</Typography>
                </Box>}
            <Box
                margin={2}
                paddingTop={4}>

                <Typography color="contained" variant="h7"><em>*Votre signature sera seulement utilisé à l'intention de signer le contrat de stage*</em></Typography>

            </Box>
        </div>
    );
}
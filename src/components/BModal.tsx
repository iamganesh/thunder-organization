import { useState } from "react";
import {Modal, Button} from "react-bootstrap";

const BModal = ({display,close,logout}:{display:boolean,close:any,logout:any}) => {
  
    return (
      <>
        <Modal
          show={display}
          onHide={close}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Modal title</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure? You want to logout?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={close}>
              Close
            </Button>
            <Button variant="primary" onClick={logout}>Logout</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
  
export default BModal;
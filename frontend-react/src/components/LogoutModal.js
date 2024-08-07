// Importing React library for creating components
import React from 'react';

const LogoutModal = ({ onClose, onLogout }) => {
  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Logout</h5>
            <button type="button" className="btn-close" onClick={onClose}></button> {/* Close button for modal */}
          </div>
          <div className="modal-body">
            <p>Are you sure you want to logout?</p>  {/* Logout confirmation message */}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close {/* Close button in footer */}
            </button>
            <button type="button" className="btn btn-primary" onClick={onLogout}>
              Logout {/* Logout button in footer */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;

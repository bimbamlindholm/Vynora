import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export function usePersonalWorkspaceConnection({ setActiveTab }) {
  const { addToast } = useToast();
  const { profile, connectPersonalAccountToWorkspace, disconnectFromWorkspace } = useAuth();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [connectCode, setConnectCode] = useState("");
  const [agreeText, setAgreeText] = useState("");
  const [disconnectAgreeText, setDisconnectAgreeText] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnectWorkspace = async (e) => {
    if (e) e.preventDefault();
    if (!connectCode.trim()) {
      addToast("Please enter a workspace code.", "warning");
      return;
    }
    setAgreeText("");
    setShowConnectModal(true);
  };

  const handleConfirmConnect = async () => {
    if (agreeText.trim().toLowerCase().replace(/\s+/g, " ") !== "i agree") {
      addToast("Please type 'I Agree' to confirm.", "warning");
      return;
    }
    setConnecting(true);
    try {
      const res = await connectPersonalAccountToWorkspace(connectCode, {
        fullName: profile?.full_name || "",
        email: profile?.email || "",
      });
      addToast(`Successfully connected to ${res.workspace.workspace_name}!`, "success");
      setShowConnectModal(false);
      setConnectCode("");
      setAgreeText("");
      setActiveTab("dashboard");
    } catch (err) {
      addToast(err.message || "Failed to connect to workspace.", "error");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectWorkspace = () => {
    setDisconnectAgreeText("");
    setShowDisconnectModal(true);
  };

  const handleConfirmDisconnect = async () => {
    if (disconnectAgreeText.trim().toLowerCase().replace(/\s+/g, " ") !== "i disconnect") {
      addToast("Please type 'I Disconnect' to confirm.", "warning");
      return;
    }
    setDisconnecting(true);
    try {
      await disconnectFromWorkspace();
      addToast("Successfully disconnected from workspace!", "success");
      setShowDisconnectModal(false);
      setDisconnectAgreeText("");
      setActiveTab("dashboard");
    } catch (err) {
      addToast(err.message || "Failed to disconnect.", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  return {
    showConnectModal,
    setShowConnectModal,
    showDisconnectModal,
    setShowDisconnectModal,
    connectCode,
    setConnectCode,
    agreeText,
    setAgreeText,
    disconnectAgreeText,
    setDisconnectAgreeText,
    connecting,
    disconnecting,
    handleConnectWorkspace,
    handleConfirmConnect,
    handleDisconnectWorkspace,
    handleConfirmDisconnect,
  };
}

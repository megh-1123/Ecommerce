import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginStart, loginSuccess, loginFailure } from "../features/auth/authSlice";
import { api } from "../services/api";

function GoogleSignInButton() {
  const buttonRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        dispatch(loginStart());
        try {
          const data = await api.post("/auth/google", { credential: response.credential });
          dispatch(loginSuccess(data));
          navigate("/");
        } catch (err) {
          dispatch(loginFailure(err.message));
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: "100%",
    });
  }, [dispatch, navigate]);

  return <div ref={buttonRef}></div>;
}

export default GoogleSignInButton;
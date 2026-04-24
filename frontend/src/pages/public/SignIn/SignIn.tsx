import {
  CssBaseline,
  TextField,
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { LockRounded } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SignInRequest } from "src/interfaces";
import { removeSpace } from "src/utils/format";
import { useAuth } from "src/hooks";
import { FORM_MSG, FORM_VLDN } from "src/utils/FormUtils";
// import logo from "src/assets/logo.png";

export default function SignIn() {
  const { handleSignIn, isSigningIn } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        // .email(MSG.invalidEmail)
        .required(FORM_MSG.required)
        .min(
          FORM_VLDN.SHORT_STRING.min,
          FORM_MSG.minLength(FORM_VLDN.SHORT_STRING.min)
        )
        .max(
          FORM_VLDN.SHORT_STRING.max,
          FORM_MSG.maxLength(FORM_VLDN.SHORT_STRING.max)
        ),
      password: Yup.string()
        .required(FORM_MSG.required)
        .min(
          FORM_VLDN.SHORT_STRING.min,
          FORM_MSG.minLength(FORM_VLDN.SHORT_STRING.min)
        )
        .max(
          FORM_VLDN.SHORT_STRING.max,
          FORM_MSG.maxLength(FORM_VLDN.SHORT_STRING.max)
        ),
    }),
    onSubmit: async (data: SignInRequest) => {
      try {
        await handleSignIn(data);
        formik.setValues(formik.initialValues);
        handleResetError();
      } catch (err) {
        throw err;
      }
    },
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
  });

  const handleResetError = () => {
    formik.setErrors({});
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
      <CssBaseline />
      <Card variant="outlined" sx={{ maxWidth: 440, mx: "auto", borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
              <LockRounded />
            </Avatar>
            <Typography component="h1" variant="h5" fontWeight={600}>
              Iniciar sesión
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresá con tu usuario para acceder al sistema.
            </Typography>
          </Stack>

          <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email o usuario"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={(e) => {
                formik.setFieldValue("email", removeSpace(e.target.value));
                handleResetError();
              }}
              error={!!formik.errors.email}
              helperText={formik.errors.email ? formik.errors.email : " "}
              variant="outlined"
              inputProps={{
                max: FORM_VLDN.SHORT_STRING.max,
                min: FORM_VLDN.SHORT_STRING.min,
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={(e) => {
                formik.setFieldValue("password", removeSpace(e.target.value));
                handleResetError();
              }}
              error={!!formik.errors.password}
              helperText={formik.errors.password ? formik.errors.password : " "}
              variant="outlined"
              inputProps={{
                max: FORM_VLDN.SHORT_STRING.max,
                min: FORM_VLDN.SHORT_STRING.min,
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, mb: 1 }}
              loading={isSigningIn}
              disabled={isSigningIn}
            >
              Ingresar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}



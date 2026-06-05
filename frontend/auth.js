const poolData = {
  UserPoolId: "ap-southeast-2_QNAcjIJC7",
  ClientId: "78pb2qlep64mv821ahn1fprcqk"
};

const userPool =
  new AmazonCognitoIdentity.CognitoUserPool(poolData);


// SIGNUP

export function signUp(email, password) {

  const attributeList = [];

  const dataEmail = {
    Name: "email",
    Value: email
  };

  const attributeEmail =
    new AmazonCognitoIdentity.CognitoUserAttribute(
      dataEmail
    );

  attributeList.push(attributeEmail);

  userPool.signUp(
    email,
    password,
    attributeList,
    null,

    (err, result) => {

      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }

      alert("Signup successful! Check your email.");

      console.log(result);
    }
  );
}


// LOGIN

export function login(event) {

  if (event) {
    event.preventDefault();
  }

  const email =
    prompt("Enter email");

  const password =
    prompt("Enter password");

  const authenticationData = {
    Username: email,
    Password: password,
  };

  const authenticationDetails =
    new AmazonCognitoIdentity.AuthenticationDetails(
      authenticationData
    );

  const userData = {
    Username: email,
    Pool: userPool,
  };

  const cognitoUser =
    new AmazonCognitoIdentity.CognitoUser(
      userData
    );

  cognitoUser.authenticateUser(
    authenticationDetails,

    {

      onSuccess: function (result) {

        const accessToken =
          result
            .getAccessToken()
            .getJwtToken();

        const idToken =
          result
            .getIdToken()
            .getJwtToken();

        localStorage.setItem(
          "accessToken",
          accessToken
        );

        localStorage.setItem(
          "idToken",
          idToken
        );

        console.log(
          "Saved Token:",
          localStorage.getItem(
            "accessToken"
          )
        );

        alert("Login successful!");
      },

      onFailure: function (err) {

        alert(
          err.message ||
          JSON.stringify(err)
        );

      },

    }
  );
}


// LOGOUT

export function logout() {

  const cognitoUser =
    userPool.getCurrentUser();

  if (cognitoUser) {

    cognitoUser.signOut();

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "idToken"
    );

    alert("Logged out");
  }
}
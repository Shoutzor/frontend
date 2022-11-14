<template>
    <h2>Register account</h2>
    <register-form 
        id="registerForm" 
        :showLoginButton="false" />
</template>

<script>
import RegisterForm from "@components/RegisterForm.vue";

export default {
    name: "register-view",
    components: {
        RegisterForm
    }
};
</script>

<style lang="scss">
#registerForm {
    .auth-register-form {
        max-width: 300px;
    }
}
</style>
<template>
    <div class="modal-admin-allowed-pets">
        <div class="title">Allowed GAG2 Pets</div>
        <AdminAllowedPets />
    </div>
</template>

<script>
import AdminAllowedPets from '@/components/admin/AdminAllowedPets';

export default {
    name: 'ModalAdminAllowedPets',
    components: { AdminAllowedPets }
}
</script>

<style scoped>
.modal-admin-allowed-pets {
    width: min(980px, 96vw);
    max-width: 980px;
    padding: 20px 22px;
    background: radial-gradient(100% 100% at 50% 0%, rgba(0, 255, 194, 0.06) 0%, rgba(7, 38, 61, 0) 80%), linear-gradient(256deg, #07263d 0%, #07243a 100%);
    border-radius: 12px;
}
.modal-admin-allowed-pets .title {
    font-size: 20px;
    font-weight: 800;
    color: #cfeaf0;
    margin-bottom: 8px;
}

.modal-admin-allowed-pets { box-sizing: border-box; }
</style>

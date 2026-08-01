<template>
    <div class="box-level" v-bind:class="'level-'+color">
        <div class="level-inner">{{level}}</div>
    </div>
</template>

<script>
    export default {
        name: 'BoxLevel',
        props: ['level', 'color']
    }
</script>

<style scoped>
    .box-level {
        width: 42px;
        height: 30px;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 12px;
        filter: drop-shadow(0 0 8px rgba(94, 214, 255, 0.18));
    }

    .box-level::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(124, 150, 174, 0.9) 0%, rgba(90, 105, 120, 0.95) 100%);
        border: 1px solid rgba(255, 255, 255, 0.14);
        clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 25%, 100% 75%, calc(100% - 8px) 100%, 8px 100%, 0 75%, 0 25%);
        box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.08), 0 0 18px rgba(115, 220, 255, 0.1);
    }

    .box-level.level-blue::before {
        background: linear-gradient(180deg, rgba(85, 158, 228, 0.9) 0%, rgba(41, 96, 161, 0.96) 100%);
        box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.1), 0 0 18px rgba(85, 158, 228, 0.28);
    }

    .box-level.level-green::before {
        background: linear-gradient(180deg, rgba(184, 233, 45, 0.9) 0%, rgba(112, 154, 21, 0.96) 100%);
        box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.1), 0 0 18px rgba(184, 233, 45, 0.3);
    }

    .box-level.level-orange::before {
        background: linear-gradient(180deg, rgba(252, 163, 17, 0.9) 0%, rgba(177, 99, 11, 0.96) 100%);
        box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.1), 0 0 18px rgba(252, 163, 17, 0.28);
    }

    .box-level.level-red::before {
        background: linear-gradient(180deg, rgba(255, 78, 78, 0.9) 0%, rgba(153, 34, 34, 0.96) 100%);
        box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.1), 0 0 18px rgba(255, 78, 78, 0.3);
    }

    .box-level.level-purple::before {
        background: linear-gradient(180deg, rgba(105, 83, 241, 0.9) 0%, rgba(71, 46, 179, 0.96) 100%);
        box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.1), 0 0 18px rgba(105, 83, 241, 0.3);
    }

    .box-level::after {
        content: '';
        position: absolute;
        inset: 2px;
        background: rgba(5, 22, 33, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.06);
        clip-path: polygon(7px 0, calc(100% - 7px) 0, 100% 25%, 100% 75%, calc(100% - 7px) 100%, 7px 100%, 0 75%, 0 25%);
    }

    .chat-message-element .box-level::after {
        background-color: rgba(5, 18, 27, 0.96);
    }

    .box-level .level-inner {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: calc(100% - 8px);
        height: calc(100% - 6px);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: rgba(255, 255, 255, 0.96);
        text-shadow: 0 0 10px currentColor;
        clip-path: polygon(7px 0, calc(100% - 7px) 0, 100% 25%, 100% 75%, calc(100% - 7px) 100%, 7px 100%, 0 75%, 0 25%);
        background: rgba(255, 255, 255, 0.02);
    }

    .box-level.level-blue .level-inner {
        color: #8ec6ff;
    }

    .box-level.level-green .level-inner {
        color: #d9ff6f;
    }

    .box-level.level-orange .level-inner {
        color: #ffca66;
    }

    .box-level.level-red .level-inner {
        color: #ff8a8a;
    }

    .box-level.level-purple .level-inner {
        color: #b8a8ff;
    }
</style>
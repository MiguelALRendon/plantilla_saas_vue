import { Component } from "vue";

export interface Module {
    nombre: string;
    permiso_clave: string;
    type: Component;
    icon: string;
}
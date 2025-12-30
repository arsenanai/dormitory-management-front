import { Component } from "vue";

export interface Card {
  value: number;
  description: string;
  bgClass: string;
  textClass: string;
  icon: Component;
  iconBgClass: string;
  iconTextClass: string;
}

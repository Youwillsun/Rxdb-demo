import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

const MODULE = [
  ButtonModule,
  InputTextModule,
  CardModule,
  TableModule,
  ToastModule,
  DialogModule,
  DropdownModule,
  InputNumberModule,
  ConfirmPopupModule,
  TagModule,
  TooltipModule,
  ConfirmDialogModule
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ...MODULE
  ],
  exports: [
    ...MODULE
  ]
})
export class PrimengModule { }

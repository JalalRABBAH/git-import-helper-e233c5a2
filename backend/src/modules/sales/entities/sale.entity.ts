import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SaleStatus, PaymentMethod, InvoiceStatus } from '@shared/enums/sale.enum';

@Entity('sales')
export class Sale {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'vehicle_id' }) vehicleId!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'client_id' }) clientId!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'seller_user_id' }) sellerUserId!: string;
  @ApiProperty({ enum: SaleStatus })
  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.DRAFT })
  status!: SaleStatus;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2 }) salePrice!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'discount_amount' }) discountAmount?: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2 }) taxAmount!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2 }) totalAmount!: number;
  @ApiProperty() @Column({ type: 'char', length: 3, default: 'XOF', name: 'currency_code' }) currencyCode!: string;
  @ApiProperty({ enum: PaymentMethod })
  @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method' })
  paymentMethod!: PaymentMethod;
  @ApiProperty() @Column({ type: 'text', nullable: true }) notes?: string;
  @ApiProperty() @Column({ type: 'jsonb', default: {} }) metadata!: Record<string, any>;
  @ApiProperty() @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @ApiProperty() @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('invoices')
export class Invoice {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'sale_id' }) saleId!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, unique: true, name: 'invoice_number' }) invoiceNumber!: string;
  @ApiProperty() @Column({ type: 'date', name: 'issue_date' }) issueDate!: Date;
  @ApiProperty() @Column({ type: 'date', name: 'due_date' }) dueDate!: Date;
  @ApiProperty({ enum: InvoiceStatus })
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status!: InvoiceStatus;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2 }) subtotal!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2 }) taxTotal!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2 }) total!: number;
  @ApiProperty() @Column({ type: 'jsonb', default: {} }) taxBreakdown!: Record<string, any>;
  @ApiProperty() @Column({ type: 'varchar', length: 500, nullable: true, name: 'storage_path' }) storagePath?: string;
  @ApiProperty() @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}

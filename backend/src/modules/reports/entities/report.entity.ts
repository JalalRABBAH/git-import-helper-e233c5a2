import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ReportPeriod, ReportStatus, ReportFormat } from '@shared/enums/report.enum';

@Entity('quarterly_reports')
export class QuarterlyReport {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty() @Column({ type: 'int', name: 'report_year' }) reportYear!: number;
  @ApiProperty({ enum: ReportPeriod })
  @Column({ type: 'enum', enum: ReportPeriod })
  period!: ReportPeriod;
  @ApiProperty({ enum: ReportStatus })
  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.DRAFT })
  status!: ReportStatus;
  @ApiProperty() @Column({ type: 'varchar', length: 500, nullable: true, name: 'xml_storage_path' }) xmlStoragePath?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 500, nullable: true, name: 'pdf_storage_path' }) pdfStoragePath?: string;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'submitted_at' }) submittedAt?: Date;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'reviewed_at' }) reviewedAt?: Date;
  @ApiProperty() @Column({ type: 'uuid', nullable: true, name: 'reviewed_by' }) reviewedBy?: string;
  @ApiProperty() @Column({ type: 'text', nullable: true, name: 'review_notes' }) reviewNotes?: string;
  @ApiProperty() @Column({ type: 'jsonb', default: {}, name: 'summary_data' }) summaryData!: Record<string, any>;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

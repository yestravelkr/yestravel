import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductTemplateCategoriesTable1760425824472
  implements MigrationInterface
{
  name = 'CreateProductTemplateCategoriesTable1760425824472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_template_categories',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'product_template_id',
            type: 'int',
          },
          {
            name: 'category_id',
            type: 'int',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            name: 'FK_product_template_categories_product_template',
            columnNames: ['product_template_id'],
            referencedTableName: 'product_template',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'FK_product_template_categories_category',
            columnNames: ['category_id'],
            referencedTableName: 'categories',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_product_template_categories_product_template_id',
            columnNames: ['product_template_id'],
          },
          {
            name: 'IDX_product_template_categories_category_id',
            columnNames: ['category_id'],
          },
          {
            name: 'UQ_product_template_categories',
            columnNames: ['product_template_id', 'category_id'],
            isUnique: true,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product_template_categories');
  }
}

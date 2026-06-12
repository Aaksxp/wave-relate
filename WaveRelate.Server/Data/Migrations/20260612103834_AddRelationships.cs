using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WaveRelate.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
                migrationBuilder.CreateTable(
                    name: "Relationships",
                    columns: table => new
                    {
                        Id = table.Column<int>(type: "int", nullable: false)
                            .Annotation("SqlServer:Identity", "1, 1"),
                        PersonId = table.Column<int>(type: "int", nullable: false),
                        RelatedPersonId = table.Column<int>(type: "int", nullable: false),
                        RelationshipType = table.Column<int>(type: "int", nullable: false),
                        CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_Relationships", x => x.Id);
                        table.ForeignKey(
                            name: "FK_Relationships_Persons_PersonId",
                            column: x => x.PersonId,
                            principalTable: "Persons",
                            principalColumn: "Id",
                            onDelete: ReferentialAction.Cascade);
                        table.ForeignKey(
                            name: "FK_Relationships_Persons_RelatedPersonId",
                            column: x => x.RelatedPersonId,
                            principalTable: "Persons",
                            principalColumn: "Id",
                            onDelete: ReferentialAction.Restrict);
                    });

                migrationBuilder.CreateIndex(
                    name: "IX_Relationships_PersonId",
                    table: "Relationships",
                    column: "PersonId");

                migrationBuilder.CreateIndex(
                    name: "IX_Relationships_RelatedPersonId",
                    table: "Relationships",
                    column: "RelatedPersonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
                migrationBuilder.DropTable(
                    name: "Relationships");
        }
    }
}

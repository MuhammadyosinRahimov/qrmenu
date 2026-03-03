using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QrMenu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyOrderStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Convert old statuses to new simplified statuses
            // Old: Pending=0, Confirmed=1, Preparing=2, Ready=3, Delivered=4, Completed=5, Cancelled=6
            // New: Pending=0, Confirmed=1, Completed=2, Cancelled=3

            // First, convert Cancelled (6 -> 3)
            migrationBuilder.Sql("UPDATE \"Orders\" SET \"Status\" = 3 WHERE \"Status\" = 6");

            // Then, convert Completed (5 -> 2)
            migrationBuilder.Sql("UPDATE \"Orders\" SET \"Status\" = 2 WHERE \"Status\" = 5");

            // Finally, convert Preparing, Ready, Delivered (2, 3, 4 -> 1 Confirmed)
            migrationBuilder.Sql("UPDATE \"Orders\" SET \"Status\" = 1 WHERE \"Status\" IN (2, 3, 4)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse the status changes
            // New: Pending=0, Confirmed=1, Completed=2, Cancelled=3
            // Old: Pending=0, Confirmed=1, Preparing=2, Ready=3, Delivered=4, Completed=5, Cancelled=6

            // Convert Cancelled (3 -> 6)
            migrationBuilder.Sql("UPDATE \"Orders\" SET \"Status\" = 6 WHERE \"Status\" = 3");

            // Convert Completed (2 -> 5)
            migrationBuilder.Sql("UPDATE \"Orders\" SET \"Status\" = 5 WHERE \"Status\" = 2");

            // Note: We cannot restore Preparing/Ready/Delivered distinction, all go to Confirmed (1)
            // which stays as 1
        }
    }
}

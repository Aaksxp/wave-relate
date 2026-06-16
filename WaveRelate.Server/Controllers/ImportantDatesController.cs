using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaveRelate.Server.Data;
using WaveRelate.Server.Models;

namespace WaveRelate.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportantDatesController : ControllerBase
{
    private readonly FamilyTreeContext _context;

    public ImportantDatesController(FamilyTreeContext context)
    {
        _context = context;
    }

    [HttpGet("by-person/{personId:int}")]
    public async Task<ActionResult<IEnumerable<ImportantDate>>> GetByPerson(int personId)
    {
        var dates = await _context.ImportantDates
            .Where(d => d.PersonId == personId)
            .OrderBy(d => d.Date)
            .ToListAsync();
        return Ok(dates);
    }

    [HttpPost]
    public async Task<ActionResult<ImportantDate>> Create(ImportantDate importantDate)
    {
        importantDate.CreatedAt = DateTime.UtcNow;
        _context.ImportantDates.Add(importantDate);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetByPerson), new { personId = importantDate.PersonId }, importantDate);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _context.ImportantDates.FindAsync(id);
        if (existing is null) return NotFound();
        _context.ImportantDates.Remove(existing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

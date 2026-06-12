using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaveRelate.Server.Data;
using WaveRelate.Server.Models;

namespace WaveRelate.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RelationshipsController : ControllerBase
{
    private readonly FamilyTreeContext _context;

    public RelationshipsController(FamilyTreeContext context)
    {
        _context = context;
    }

    [HttpGet("by-person/{personId:int}")]
    public async Task<ActionResult<IEnumerable<Relationship>>> GetByPerson(int personId)
    {
        var rels = await _context.Relationships
            .Include(r => r.Person)
            .Include(r => r.RelatedPerson)
            .Where(r => r.PersonId == personId || r.RelatedPersonId == personId)
            .ToListAsync();

        return Ok(rels);
    }

    [HttpPost]
    public async Task<ActionResult<Relationship>> Create(Relationship r)
    {
        if (r.PersonId == r.RelatedPersonId)
        {
            return BadRequest("A relationship cannot reference the same person twice.");
        }

        if (!await _context.Persons.AnyAsync(p => p.Id == r.PersonId)
            || !await _context.Persons.AnyAsync(p => p.Id == r.RelatedPersonId))
        {
            return BadRequest("Both people must exist before creating a relationship.");
        }

        var duplicate = await _context.Relationships.AnyAsync(existing =>
            existing.PersonId == r.PersonId && existing.RelatedPersonId == r.RelatedPersonId && existing.RelationshipType == r.RelationshipType
            || (r.RelationshipType == RelationshipType.Spouse || r.RelationshipType == RelationshipType.Sibling)
                && existing.PersonId == r.RelatedPersonId && existing.RelatedPersonId == r.PersonId && existing.RelationshipType == r.RelationshipType
            || r.RelationshipType == RelationshipType.Parent
                && existing.PersonId == r.RelatedPersonId && existing.RelatedPersonId == r.PersonId && existing.RelationshipType == RelationshipType.Child
            || r.RelationshipType == RelationshipType.Child
                && existing.PersonId == r.RelatedPersonId && existing.RelatedPersonId == r.PersonId && existing.RelationshipType == RelationshipType.Parent);

        if (duplicate)
        {
            return Conflict("A matching relationship already exists.");
        }

        r.CreatedAt = DateTime.UtcNow;
        _context.Relationships.Add(r);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetByPerson), new { personId = r.PersonId }, r);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var rel = await _context.Relationships.FindAsync(id);
        if (rel is null) return NotFound();
        _context.Relationships.Remove(rel);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

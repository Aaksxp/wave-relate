using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaveRelate.Server.Data;

namespace WaveRelate.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SummaryController : ControllerBase
{
    private readonly FamilyTreeContext _context;

    public SummaryController(FamilyTreeContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<SummaryDto>> Get()
    {
        var totalPeople = await _context.Persons.CountAsync();
        var totalRelationships = await _context.Relationships.CountAsync();

        return Ok(new SummaryDto
        {
            TotalPeople = totalPeople,
            TotalRelationships = totalRelationships
        });
    }
}

public class SummaryDto
{
    public int TotalPeople { get; set; }
    public int TotalRelationships { get; set; }
}

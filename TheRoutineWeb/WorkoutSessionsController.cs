using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using TheRoutineWeb.Data;
using TheRoutineWeb.Models;

namespace TheRoutineWeb
{
    public class WorkoutSessionsController : Controller
    {
        private readonly AppDbContext _context;

        public WorkoutSessionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: WorkoutSessions
        public async Task<IActionResult> Index()
        {
            var appDbContext = _context.WorkoutSessions.Include(w => w.WorkoutCycle);
            return View(await appDbContext.ToListAsync());
        }

        // GET: WorkoutSessions/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var workoutSession = await _context.WorkoutSessions
                .Include(w => w.WorkoutCycle)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (workoutSession == null)
            {
                return NotFound();
            }

            return View(workoutSession);
        }

        // GET: WorkoutSessions/Create
        public IActionResult Create()
        {
            ViewData["WorkoutCycleId"] = new SelectList(_context.WorkoutCycles, "Id", "Id");
            return View();
        }

        // POST: WorkoutSessions/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,UserId,WorkoutCycleId,Date,DayIndex,Label")] WorkoutSession workoutSession)
        {
            if (ModelState.IsValid)
            {
                _context.Add(workoutSession);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["WorkoutCycleId"] = new SelectList(_context.WorkoutCycles, "Id", "Id", workoutSession.WorkoutCycleId);
            return View(workoutSession);
        }

        // GET: WorkoutSessions/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var workoutSession = await _context.WorkoutSessions.FindAsync(id);
            if (workoutSession == null)
            {
                return NotFound();
            }
            ViewData["WorkoutCycleId"] = new SelectList(_context.WorkoutCycles, "Id", "Id", workoutSession.WorkoutCycleId);
            return View(workoutSession);
        }

        // POST: WorkoutSessions/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,UserId,WorkoutCycleId,Date,DayIndex,Label")] WorkoutSession workoutSession)
        {
            if (id != workoutSession.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(workoutSession);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!WorkoutSessionExists(workoutSession.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            ViewData["WorkoutCycleId"] = new SelectList(_context.WorkoutCycles, "Id", "Id", workoutSession.WorkoutCycleId);
            return View(workoutSession);
        }

        // GET: WorkoutSessions/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var workoutSession = await _context.WorkoutSessions
                .Include(w => w.WorkoutCycle)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (workoutSession == null)
            {
                return NotFound();
            }

            return View(workoutSession);
        }

        // POST: WorkoutSessions/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var workoutSession = await _context.WorkoutSessions.FindAsync(id);
            if (workoutSession != null)
            {
                _context.WorkoutSessions.Remove(workoutSession);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool WorkoutSessionExists(int id)
        {
            return _context.WorkoutSessions.Any(e => e.Id == id);
        }
    }
}
